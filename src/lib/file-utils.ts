export interface SerializedFile {
  name: string
  type: string
  size: number
  lastModified: number
  dataUrl: string
}

export async function fileToSerializable(file: File): Promise<SerializedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        dataUrl: reader.result as string,
      })
    }
    
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function serializableToFile(serialized: SerializedFile): Promise<File> {
  const response = await fetch(serialized.dataUrl)
  const blob = await response.blob()
  
  return new File([blob], serialized.name, {
    type: serialized.type,
    lastModified: serialized.lastModified,
  })
}

export async function filesToSerializable(files: File[]): Promise<SerializedFile[]> {
  return Promise.all(files.map(fileToSerializable))
}

export async function serializableToFiles(serialized: SerializedFile[]): Promise<File[]> {
  return Promise.all(serialized.map(serializableToFile))
}
