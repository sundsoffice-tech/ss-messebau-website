import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Info } from '@phosphor-icons/react'
import { FileUpload, UploadedFile } from '@/components/FileUpload'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Step4Data {
  druckdatenVorhanden: boolean
  dateien?: File[]
  grafikservice?: boolean
  designwunsch?: string
  kommentar?: string
}

interface ConfiguratorStep4Props {
  data: Step4Data
  onChange: (data: Partial<Step4Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep4({ data, onChange, onNext, onBack }: ConfiguratorStep4Props) {
  const { t } = useTranslation()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    if (data.dateien && data.dateien.length > 0) {
      const mapped: UploadedFile[] = data.dateien.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        file,
        progress: 100,
        status: 'success' as const,
      }))
      setUploadedFiles(mapped)
    }
  }, [])

  const handleFileChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    const actualFiles = files.map(f => f.file)
    onChange({ dateien: actualFiles })
  }

  const canProceed = () => {
    if (!data.druckdatenVorhanden && !data.designwunsch?.trim()) {
      return false
    }
    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step4.title')}</h2>
        <p className="text-muted-foreground">
          {t('step4.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step4.printDataAvailable')}</Label>
          <RadioGroup
            value={data.druckdatenVorhanden ? 'ja' : 'nein'}
            onValueChange={(value) => onChange({ druckdatenVorhanden: value === 'ja' })}
          >
            <Label
              htmlFor="druck-ja"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="ja" id="druck-ja" />
              <span>{t('step4.yesUpload')}</span>
            </Label>
            <Label
              htmlFor="druck-nein"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="nein" id="druck-nein" />
              <span>{t('step4.noGraphicService')}</span>
            </Label>
          </RadioGroup>
        </div>

        {data.druckdatenVorhanden ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <FileUpload
              files={uploadedFiles}
              onChange={handleFileChange}
              maxFiles={10}
              maxFileSize={100 * 1024 * 1024}
              acceptedTypes={['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png', '.tif', '.tiff']}
            />
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>{t('step4.printRequirements.title')}</strong> {t('step4.printRequirements.text')}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <Alert className="border-primary bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                <strong>{t('step4.graphicService.title')}</strong> {t('step4.graphicService.text')}
              </AlertDescription>
            </Alert>
            
            <div>
              <Label htmlFor="designwunsch" className="text-base font-semibold">
                {t('step4.designDescription.label')}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('step4.designDescription.hint')}
              </p>
              <Textarea
                id="designwunsch"
                value={data.designwunsch || ''}
                onChange={(e) => onChange({ designwunsch: e.target.value })}
                placeholder={t('step4.designDescription.placeholder')}
                className="mt-2 h-40"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {data.designwunsch?.length || 0} / 1000 {t('step4.characters')}
              </p>
            </div>

            <div>
              <Label htmlFor="logo-upload" className="text-base font-semibold">
                {t('step4.logoUpload.label')}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('step4.logoUpload.hint')}
              </p>
              <FileUpload
                files={uploadedFiles}
                onChange={handleFileChange}
                maxFiles={5}
                maxFileSize={50 * 1024 * 1024}
                acceptedTypes={['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png', '.svg']}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="kommentar" className="text-base font-semibold">
            {t('step4.comment.label')}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t('step4.comment.hint')}
          </p>
          <Textarea
            id="kommentar"
            value={data.kommentar || ''}
            onChange={(e) => onChange({ kommentar: e.target.value })}
            placeholder={t('step4.comment.placeholder')}
            className="mt-2"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {data.kommentar?.length || 0} / 500 {t('step4.characters')}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('step4.back')}
        </Button>
        <Button 
          onClick={onNext} 
          size="lg"
          disabled={!canProceed()}
        >
          {t('step4.next')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
