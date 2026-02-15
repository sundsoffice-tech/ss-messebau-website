import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface Step5Data {
  firma: string
  strasse: string
  plz: string
  ort: string
  land: string
  wunschDatum?: string
  express: boolean
  lieferart: string
  zeitfenster?: string
}

interface ConfiguratorStep5Props {
  data: Step5Data
  onChange: (data: Partial<Step5Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep5({ data, onChange, onNext, onBack }: ConfiguratorStep5Props) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.strasse) newErrors.strasse = t('step5.error.street')
    if (!data.plz || data.plz.length !== 5) newErrors.plz = t('step5.error.zip')
    if (!data.ort) newErrors.ort = t('step5.error.city')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step5.title')}</h2>
        <p className="text-muted-foreground">{t('step5.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="firma">{t('step5.company')}</Label>
          <Input
            id="firma"
            value={data.firma}
            onChange={(e) => onChange({ firma: e.target.value })}
            placeholder={t('step5.companyPlaceholder')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="strasse">{t('step5.street')}</Label>
            <Input
              id="strasse"
              value={data.strasse}
              onChange={(e) => onChange({ strasse: e.target.value })}
              placeholder={t('step5.streetPlaceholder')}
              className="mt-1"
            />
            {errors.strasse && <p className="text-sm text-destructive mt-1">{errors.strasse}</p>}
          </div>
          <div>
            <Label htmlFor="plz">{t('step5.zip')}</Label>
            <Input
              id="plz"
              value={data.plz}
              onChange={(e) => onChange({ plz: e.target.value })}
              placeholder="12345"
              maxLength={5}
              className="mt-1"
            />
            {errors.plz && <p className="text-sm text-destructive mt-1">{errors.plz}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="ort">{t('step5.city')}</Label>
          <Input
            id="ort"
            value={data.ort}
            onChange={(e) => onChange({ ort: e.target.value })}
            placeholder={t('step5.cityPlaceholder')}
            className="mt-1"
          />
          {errors.ort && <p className="text-sm text-destructive mt-1">{errors.ort}</p>}
        </div>

        <div>
          <Label htmlFor="wunschDatum">{t('step5.deliveryDate')}</Label>
          <Input
            id="wunschDatum"
            type="date"
            value={data.wunschDatum || ''}
            onChange={(e) => onChange({ wunschDatum: e.target.value })}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">{t('step5.deliveryTime')}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="express"
            checked={data.express}
            onCheckedChange={(checked) => onChange({ express: checked as boolean })}
          />
          <Label htmlFor="express" className="cursor-pointer">
            {t('step5.expressLabel')}
          </Label>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step5.deliveryMethod')}</Label>
          <RadioGroup
            value={data.lieferart}
            onValueChange={(value) => onChange({ lieferart: value })}
          >
            <Label
              htmlFor="spedition"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                data.lieferart === 'spedition' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="spedition" id="spedition" />
              <span>{t('step5.shipping')}</span>
            </Label>
            <Label
              htmlFor="abholung"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                data.lieferart === 'abholung' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="abholung" id="abholung" />
              <span>{t('step5.pickup')}</span>
            </Label>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('step5.back')}
        </Button>
        <Button onClick={handleNext}>
          {t('step5.next')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
