<?php
/**
 * S&S Messebau - Blog API
 * CRUD endpoints for blog posts
 * GET: public (no auth), POST/PATCH/DELETE: admin auth required
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetBlogPosts();
        break;
    case 'POST':
        handleCreateBlogPost();
        break;
    case 'PATCH':
        handleUpdateBlogPost();
        break;
    case 'DELETE':
        handleDeleteBlogPost();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGetBlogPosts(): void {
    // GET is public – no auth required
    $db = getDB();
    $slug = $_GET['slug'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($slug) {
        $stmt = $db->prepare('SELECT * FROM blog_posts WHERE slug = :slug');
        $stmt->execute([':slug' => $slug]);
        $post = $stmt->fetch();
        if ($post) {
            echo json_encode(formatPost($post));
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Blog post not found']);
        }
        return;
    }

    if ($id) {
        $stmt = $db->prepare('SELECT * FROM blog_posts WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $post = $stmt->fetch();
        if ($post) {
            echo json_encode(formatPost($post));
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Blog post not found']);
        }
        return;
    }

    $category = $_GET['category'] ?? null;
    $sql = 'SELECT * FROM blog_posts';
    $params = [];

    if ($category) {
        $sql .= ' WHERE category = :category';
        $params[':category'] = $category;
    }
    $sql .= ' ORDER BY published_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $posts = $stmt->fetchAll();

    $result = array_map('formatPost', $posts);
    echo json_encode(['posts' => $result, 'total' => count($result)]);
}

function handleCreateBlogPost(): void {
    if (!requireAuth()) return;

    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['title']) || empty($input['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'title and content are required']);
        return;
    }

    $slug = $input['slug'] ?? generateSlug($input['title']);

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO blog_posts (slug, title, category, image_url, excerpt, content, published_at)
        VALUES (:slug, :title, :category, :image_url, :excerpt, :content, :published_at)
    ');

    $publishedAt = $input['publishedAt'] ?? null;
    if ($publishedAt && is_numeric($publishedAt)) {
        $publishedAt = date('Y-m-d H:i:s', (int)($publishedAt / 1000));
    } elseif (!$publishedAt) {
        $publishedAt = date('Y-m-d H:i:s');
    }

    $stmt->execute([
        ':slug' => $slug,
        ':title' => $input['title'],
        ':category' => $input['category'] ?? 'sonstiges',
        ':image_url' => $input['imageUrl'] ?? '',
        ':excerpt' => $input['excerpt'] ?? '',
        ':content' => $input['content'],
        ':published_at' => $publishedAt,
    ]);

    $id = $db->lastInsertId();
    $fetchStmt = $db->prepare('SELECT * FROM blog_posts WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $post = $fetchStmt->fetch();

    echo json_encode(['success' => true, 'post' => formatPost($post)]);
}

function handleUpdateBlogPost(): void {
    if (!requireAuth()) return;

    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $sets = [];
    $params = [':id' => $id];

    $fieldMap = [
        'title' => 'title',
        'slug' => 'slug',
        'category' => 'category',
        'imageUrl' => 'image_url',
        'excerpt' => 'excerpt',
        'content' => 'content',
    ];

    foreach ($fieldMap as $inputKey => $dbCol) {
        if (isset($input[$inputKey])) {
            $sets[] = "$dbCol = :$dbCol";
            $params[":$dbCol"] = $input[$inputKey];
        }
    }

    if (isset($input['publishedAt'])) {
        $publishedAt = $input['publishedAt'];
        if (is_numeric($publishedAt)) {
            $publishedAt = date('Y-m-d H:i:s', (int)($publishedAt / 1000));
        }
        $sets[] = 'published_at = :published_at';
        $params[':published_at'] = $publishedAt;
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE blog_posts SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteBlogPost(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM blog_posts WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function formatPost(array $post): array {
    return [
        'id' => (string)$post['id'],
        'slug' => $post['slug'],
        'title' => $post['title'],
        'category' => $post['category'],
        'imageUrl' => $post['image_url'] ?? '',
        'excerpt' => $post['excerpt'] ?? '',
        'content' => $post['content'],
        'publishedAt' => $post['published_at'] ? strtotime($post['published_at']) * 1000 : 0,
        'createdAt' => strtotime($post['created_at']) * 1000,
        'updatedAt' => strtotime($post['updated_at']) * 1000,
    ];
}

function generateSlug(string $title): string {
    $slug = mb_strtolower($title, 'UTF-8');
    $slug = str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], $slug);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}
