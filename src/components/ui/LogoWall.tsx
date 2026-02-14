const logos = [
  { name: 'Feinkost Meyer', branche: 'Food' },
  { name: 'Allianz Regional', branche: 'Finance' },
  { name: 'TechnoPlast', branche: 'Industrie' },
  { name: 'BioGourmet', branche: 'Food' },
  { name: 'SecurLife', branche: 'Finance' },
  { name: 'MaschTech', branche: 'Industrie' },
]

export function LogoWall() {
  return (
    <section className="py-8 sm:py-10 bg-muted/50 border-y">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
          Vertrauen von Unternehmen aus Food, Finance & Industrie
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">{logo.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{logo.branche}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
