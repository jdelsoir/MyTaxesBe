// Waar gaat mijn belastinggeld naartoe — static, hash-routed, zero runtime deps.
const POPULATION = 11_700_000;
const YEARS = [2023, 2024, 2025];

const FN_COLOR = {
  social_protection: '#c8102e', regions_communities: '#1d3461', finance_admin: '#e0a200',
  debt_interest: '#4a4a4a', security_interior: '#1f6fce', defense: '#4c6663',
  foreign_eu: '#7a5195', mobility: '#007068', justice: '#a83d77',
  economy_work_science: '#2f7a34', health: '#ff764a', democratic_institutions: '#5f5f5f',
};
const LIGHT = new Set(['finance_admin', 'health']);
const FN_ICON = {
  social_protection: 'heart-handshake', health: 'stethoscope', regions_communities: 'map',
  debt_interest: 'percent', defense: 'shield', justice: 'scale', security_interior: 'siren',
  mobility: 'train-front', finance_admin: 'banknote', foreign_eu: 'globe',
  economy_work_science: 'briefcase', democratic_institutions: 'landmark',
};
const ICONS = globalThis.ICONS || {};
const CONTENT = globalThis.CONTENT || {};
const LEVELS = globalThis.LEVELS || {};
const LEVEL_IDS = ['federal', 'region', 'community', 'commune'];

const SOURCES = [
  { name: 'data.gov.be — Federal budget (FPS BOSA)', url: 'https://data.gov.be/en/datasets/fpsbosa-bb-budget-2024', lic: 'CC0', desc: { nl: 'De federale begroting per departement (treemap, thema’s).', fr: 'Le budget fédéral par département (treemap, thèmes).', en: 'The federal budget by department (treemap, themes).' } },
  { name: 'FPS Finance — Federally collected tax revenues', url: 'https://finance.belgium.be/en/figures_and_analysis/figures', lic: 'CC0', desc: { nl: 'Federaal geïnde belastingen (btw, accijnzen).', fr: 'Impôts perçus au fédéral (TVA, accises).', en: 'Federally collected taxes (VAT, excise).' } },
  { name: 'FPS Finance — Municipal tax rates 2024', url: 'https://finance.belgium.be/sites/default/files/downloads/111-municipal-tax-rate-2024.pdf', lic: 'PDF', desc: { nl: 'Aanvullende gemeentebelasting per gemeente (581).', fr: 'Taxe communale additionnelle par commune (581).', en: 'Additional communal tax rate per commune (581).' } },
  { name: 'Statbel — Open data', url: 'https://statbel.fgov.be/en/open-data', lic: 'CC BY 4.0', desc: { nl: 'Bevolking en inkomensstatistieken.', fr: 'Population et statistiques de revenus.', en: 'Population and income statistics.' } },
  { name: 'Open Data Wallonie-Bruxelles (ODWB)', url: 'https://www.odwb.be/', lic: 'CC BY', desc: { nl: 'Waalse gemeentebegrotingen (gepland, Fase 3).', fr: 'Budgets communaux wallons (prévu, Phase 3).', en: 'Walloon municipal budgets (planned, Phase 3).' } },
  { name: 'belgium.be — Government & competences', url: 'https://www.belgium.be/en/about_belgium/government', lic: 'gov', desc: { nl: 'Bevoegdheden per overheidsniveau.', fr: 'Compétences par niveau de pouvoir.', en: 'Competences by level of government.' } },
  { name: 'data.gov.be — Open data portal', url: 'https://data.gov.be/en', lic: 'portal', desc: { nl: 'Belgisch federaal open-dataportaal.', fr: 'Portail fédéral belge des données ouvertes.', en: 'Belgian federal open-data portal.' } },
  { name: 'Lucide — Icons', url: 'https://lucide.dev', lic: 'ISC', desc: { nl: 'De iconen in deze app.', fr: 'Les icônes de cette app.', en: 'The icons in this app.' } },
];

const I18N = {
  nl: {
    skip: 'Naar inhoud', title: 'Waar gaat mijn belastinggeld naartoe?',
    nav_home: 'Start', nav_budget: 'Begroting', nav_compare: 'Vergelijk', nav_you: 'Jij', nav_about: 'Info',
    compare_h: 'Vergelijk jaren', compare_sub: 'Verandering per thema tussen twee jaren.',
    compare_from: 'Van', compare_to: 'Naar', compare_total: 'Totale uitgaven',
    compare_caveat: '⚠️ Grote verschuivingen kunnen door herklassering tussen departementen komen, niet door beleid. Vergelijk met voorzichtigheid.',
    compare_unreliable: '⚠️ Een voorlopig jaar (2025) is onvolledig — de vergelijking is niet betrouwbaar.',
    provisional_badge: 'voorlopig',
    provisional_banner: '⚠️ 2025 is een voorlopige begroting (lopende zaken) — bedragen zijn onvolledig en niet vergelijkbaar.',
    home_kicker: 'Federale begroting · België',
    home_q: 'Waar gaat jouw belastinggeld naartoe?',
    home_lead: 'De federale overheid van België gaf in {year} ongeveer dit uit. Zie waar — en wat jouw deel is.',
    home_perday: '= {v} per inwoner, elke dag',
    hook_label: 'Wat verdien je bruto per jaar?',
    hook_cta: 'Toon mijn bijdrage',
    home_explore: 'Verken de begroting',
    home_explore_sub: 'Treemap, thema’s en alle posten',
    home_you: 'Jouw bijdrage',
    home_you_sub: 'Zie hoe jouw belasting verdeeld wordt',
    home_levels: 'Wie doet wat', home_levels_sub: 'Federaal, gewest, gemeenschap, gemeente',
    levels_h: 'Wie doet wat', levels_sub: 'Vier overheidsniveaus innen belastingen en geven uit. Klik een niveau.',
    lvl_taxes: 'Welke belastingen', lvl_spends: 'Waarvoor', lvl_funding: 'Financiering', back_levels: 'Alle niveaus',
    stat_total: 'totale federale uitgaven', stat_capita: 'per inwoner / jaar', stat_day: 'per inwoner / dag',
    budget_h: 'De begroting', budget_sub: 'Klik op een thema voor uitleg, of zoom in de treemap.',
    tm_h: 'In één oogopslag', tm_sub: 'Elk blok = een uitgavenpost. Klik om in te zoomen.',
    cats_h: 'Thema’s', show_data: 'Toon als tabel (toegankelijk)',
    dt_h: 'Alle posten', dl_json: 'Download JSON', dl_csv: 'Download CSV',
    th_function: 'Thema', th_amount: 'Bedrag', th_share: 'Aandeel',
    you_h: 'Jouw bijdrage',
    you_sub: 'Geef je bruto jaarinkomen in. We schatten je personenbelasting en tonen hoe dat bedrag verdeeld zou worden in dezelfde verhoudingen als de begroting. Het is een illustratie — niet je exacte aanslag.',
    db_label: 'Bruto jaarinkomen',
    bylevel_h: 'Jouw belasting per niveau', bylevel_sub: 'Kies je gemeente om je belasting te verdelen over federaal, gewest en gemeente.',
    pick_commune: 'Jouw gemeente', lvl_federal: 'Federaal', lvl_regional: 'Gewest', lvl_communal: 'Gemeente',
    communities_note: 'De gemeenschappen (onderwijs, cultuur) hebben geen eigen belasting — ze worden uit federaal geld betaald. Schatting; gewestelijk aandeel ~25% van de personenbelasting.',
    commune_notfound: 'Gemeente niet in de lijst (aanslagjaar 2024, 581 gemeenten; fusies van 2025 kunnen ontbreken). Gemeentelijk aandeel = 0; federaal en gewest blijven gelden.',
    db_disclaimer: 'Schatting. Enkel de federale personenbelasting (zonder gemeentebelasting), vereenvoudigd (alleenstaande, geen aftrekposten), illustratief.',
    extras_h: 'Andere belastingen', extras_sub: 'Je betaalt ook indirecte belastingen. Vul je uitgaven en verbruik in — wij berekenen de belasting.',
    tax_vat: 'BTW op dagelijkse uitgaven', tax_insurance: 'Verzekeringen', tax_energy: 'Energie (gas + elektriciteit)', tax_fuel: 'Brandstof', tax_alcohol: 'Alcohol', tax_tobacco: 'Sigaretten',
    info_more: 'Meer info',
    unit_vat: '€/maand', unit_insurance: '€/maand', unit_energy: '€/maand', unit_fuel: 'liter/maand', unit_alcohol: '€/maand', unit_tobacco: 'pakjes/maand',
    ex_info_vat: 'Standaard btw is 21%. Vul je dagelijkse uitgaven in (huur en energie uitgesloten; voeding lager belast) — bovengrens.',
    ex_info_insurance: 'Taks op verzekeringspremies: 9,25%. Vul je maandpremies in (auto, woning, enz.).',
    ex_info_energy: 'Je maandelijkse energiefactuur. ~8% is federale belasting (6% btw + heffingen); distributiekosten zijn gewestelijk.',
    ex_info_fuel: 'Aantal liter brandstof per maand. ~€0,90 belasting per liter (accijns + btw).',
    ex_info_alcohol: 'Je maandbudget voor alcohol. ~35% ervan is belasting (accijns + btw).',
    ex_info_tobacco: 'Aantal pakjes per maand. Pakje van €13, ~78% is belasting.',
    total_contribution: 'Totale bijdrage', of_which_income: 'inkomstenbelasting', of_which_indirect: 'indirecte belastingen',
    extras_note: 'Schattingen: btw 21% op uitgaven, verzekeringstaks 9,25%, ~8% federale belasting op je energiefactuur, pakje sigaretten €13 (~78%), ~€0,90 per liter brandstof, ~35% van je alcoholbudget.',
    tax_est: 'Geschatte personenbelasting', your_split: 'verdeeld over de begroting:',
    per_year: '/jaar', per_day: '/dag', billion: 'mld', million: 'mln',
    back_all: 'Alle thema’s', of_total: 'van de begroting', per_capita: 'per inwoner',
    cat_covers: 'Wat dit dekt', cat_depts: 'Waar dit naartoe gaat', cat_your: 'Jouw bijdrage hieraan',
    cat_your_note: 'Op basis van je inkomen en geschatte andere belastingen. Wijzig bij ‘Jij’.',
    prev_cat: 'Vorige', next_cat: 'Volgende', to_you: 'Bereken jouw deel',
    about_h: 'Over deze app', read_caveats: 'Goed om te weten',
    sources_h: 'Databronnen', sources_sub: 'Alle data komt van officiële open-databronnen. Links openen in een nieuw tabblad.',
    cv_health: 'Gezondheid lijkt klein (1,1%) omdat de ziekteverzekering via de sociale zekerheid loopt — die zit in “Sociale bescherming”.',
    cv_financing: 'Financieringsverrichtingen (schuldaflossing en financiële operaties) zijn uitgesloten; enkel de rente telt mee als kost.',
    cv_year: 'Enkel 2023 en 2024 zijn volledige jaren in de open data. 2025 is voorlopig.',
    cv_estimate: 'De “jouw bijdrage”-berekening is illustratief: magnitudes schalen met je inkomen, de verhoudingen zijn voor iedereen gelijk.',
    foot_src: 'Bron: data.gov.be — Federale begroting (FPS BOSA), licentie CC0. Bevolking: Statbel.',
    foot_meta: 'Open data · gegenereerd uit de officiële begroting · geen persoonsgegevens · iconen: Lucide (ISC).',
    note_ai: 'Deze app is gemaakt met behulp van AI op basis van openbare data. We verzamelen geen persoonsgegevens.',
    note_calc: 'Dit is een eenvoudige rekenmodule — de cijfers zijn slechts een illustratie. Echte berekeningen zijn veel complexer en hangen af van de situatie van elke persoon in België. Voor echte cijfers, neem contact op met de',
    fin_name: 'FOD Financiën', fin_url: 'https://finance.belgium.be/nl',
    other: 'Andere',
  },
  fr: {
    skip: 'Aller au contenu', title: 'Où va l’argent de mes impôts ?',
    nav_home: 'Accueil', nav_budget: 'Budget', nav_compare: 'Comparer', nav_you: 'Vous', nav_about: 'Infos',
    compare_h: 'Comparer les années', compare_sub: 'Évolution par thème entre deux années.',
    compare_from: 'De', compare_to: 'À', compare_total: 'Dépenses totales',
    compare_caveat: '⚠️ De grands écarts peuvent venir de reclassements entre administrations, pas de la politique. Comparez avec prudence.',
    compare_unreliable: '⚠️ Une année provisoire (2025) est incomplète — la comparaison n’est pas fiable.',
    provisional_badge: 'provisoire',
    provisional_banner: '⚠️ 2025 est un budget provisoire (affaires courantes) — montants incomplets et non comparables.',
    home_kicker: 'Budget fédéral · Belgique',
    home_q: 'Où va l’argent de vos impôts ?',
    home_lead: 'L’État fédéral belge a dépensé environ ceci en {year}. Voyez où — et quelle est votre part.',
    home_perday: '= {v} par habitant, chaque jour',
    hook_label: 'Quel est votre revenu annuel brut ?',
    hook_cta: 'Voir ma contribution',
    home_explore: 'Explorer le budget',
    home_explore_sub: 'Treemap, thèmes et tous les postes',
    home_you: 'Votre contribution',
    home_you_sub: 'Voyez comment votre impôt est réparti',
    home_levels: 'Qui fait quoi', home_levels_sub: 'Fédéral, région, communauté, commune',
    levels_h: 'Qui fait quoi', levels_sub: 'Quatre niveaux de pouvoir prélèvent des impôts et dépensent. Cliquez un niveau.',
    lvl_taxes: 'Quels impôts', lvl_spends: 'Pour quoi', lvl_funding: 'Financement', back_levels: 'Tous les niveaux',
    stat_total: 'dépenses fédérales totales', stat_capita: 'par habitant / an', stat_day: 'par habitant / jour',
    budget_h: 'Le budget', budget_sub: 'Cliquez un thème pour l’explication, ou zoomez dans la treemap.',
    tm_h: 'En un coup d’œil', tm_sub: 'Chaque bloc = un poste. Cliquez pour zoomer.',
    cats_h: 'Thèmes', show_data: 'Afficher en tableau (accessible)',
    dt_h: 'Tous les postes', dl_json: 'Télécharger JSON', dl_csv: 'Télécharger CSV',
    th_function: 'Thème', th_amount: 'Montant', th_share: 'Part',
    you_h: 'Votre contribution',
    you_sub: 'Indiquez votre revenu annuel brut. Nous estimons votre impôt et montrons comment ce montant se répartirait selon les mêmes proportions que le budget. C’est une illustration — pas votre calcul exact.',
    db_label: 'Revenu annuel brut',
    bylevel_h: 'Vos impôts par niveau', bylevel_sub: 'Choisissez votre commune pour répartir vos impôts entre fédéral, région et commune.',
    pick_commune: 'Votre commune', lvl_federal: 'Fédéral', lvl_regional: 'Région', lvl_communal: 'Commune',
    communities_note: 'Les communautés (enseignement, culture) n’ont pas d’impôt propre — financées par l’argent fédéral. Estimation ; part régionale ~25 % de l’IPP.',
    commune_notfound: 'Commune absente de la liste (exercice 2024, 581 communes ; les fusions de 2025 peuvent manquer). Part communale = 0 ; fédéral et région restent valables.',
    db_disclaimer: 'Estimation. Impôt fédéral des personnes physiques uniquement (hors taxe communale), simplifié (isolé, sans déductions), illustratif.',
    extras_h: 'Autres impôts', extras_sub: 'Vous payez aussi des impôts indirects. Indiquez vos dépenses et votre consommation — nous calculons la taxe.',
    tax_vat: 'TVA sur dépenses courantes', tax_insurance: 'Assurances', tax_energy: 'Énergie (gaz + électricité)', tax_fuel: 'Carburant', tax_alcohol: 'Alcool', tax_tobacco: 'Cigarettes',
    info_more: 'Plus d’infos',
    unit_vat: '€/mois', unit_insurance: '€/mois', unit_energy: '€/mois', unit_fuel: 'litres/mois', unit_alcohol: '€/mois', unit_tobacco: 'paquets/mois',
    ex_info_vat: 'La TVA standard est de 21 %. Indiquez vos dépenses courantes (hors loyer et énergie ; alimentation taxée moins) — estimation haute.',
    ex_info_insurance: 'Taxe sur les primes d’assurance : 9,25 %. Indiquez vos primes mensuelles (auto, habitation, etc.).',
    ex_info_energy: 'Votre facture d’énergie mensuelle. ~8 % de taxes fédérales (TVA 6 % + prélèvements) ; la distribution est régionale.',
    ex_info_fuel: 'Litres de carburant par mois. ~0,90 € de taxe par litre (accises + TVA).',
    ex_info_alcohol: 'Votre budget alcool mensuel. ~35 % sont des taxes (accises + TVA).',
    ex_info_tobacco: 'Paquets par mois. Paquet à 13 €, ~78 % de taxes.',
    total_contribution: 'Contribution totale', of_which_income: 'impôt sur le revenu', of_which_indirect: 'impôts indirects',
    extras_note: 'Estimations : TVA 21 % sur les dépenses, taxe d’assurance 9,25 %, ~8 % de taxes fédérales sur l’énergie, paquet 13 € (~78 %), ~0,90 € par litre, ~35 % du budget alcool.',
    tax_est: 'Impôt estimé', your_split: 'réparti selon le budget :',
    per_year: '/an', per_day: '/jour', billion: 'mrd', million: 'mio',
    back_all: 'Tous les thèmes', of_total: 'du budget', per_capita: 'par habitant',
    cat_covers: 'Ce que ça couvre', cat_depts: 'Où va cet argent', cat_your: 'Votre contribution à ceci',
    cat_your_note: 'Sur base de votre revenu et des autres impôts estimés. Modifiable dans ‘Vous’.',
    prev_cat: 'Précédent', next_cat: 'Suivant', to_you: 'Calculer ma part',
    about_h: 'À propos', read_caveats: 'Bon à savoir',
    sources_h: 'Sources de données', sources_sub: 'Toutes les données proviennent de sources ouvertes officielles. Les liens s’ouvrent dans un nouvel onglet.',
    cv_health: 'La santé paraît faible (1,1 %) car l’assurance maladie passe par la sécurité sociale — incluse dans « Protection sociale ».',
    cv_financing: 'Les opérations de financement (remboursement de la dette et opérations financières) sont exclues ; seuls les intérêts comptent comme coût.',
    cv_year: 'Seules 2023 et 2024 sont des années complètes en open data. 2025 est provisoire.',
    cv_estimate: 'Le calcul « votre contribution » est illustratif : les montants varient avec le revenu, les proportions sont identiques pour tous.',
    foot_src: 'Source : data.gov.be — Budget fédéral (SPF BOSA), licence CC0. Population : Statbel.',
    foot_meta: 'Open data · généré à partir du budget officiel · aucune donnée personnelle · icônes : Lucide (ISC).',
    note_ai: 'Cette application a été réalisée à l’aide de l’IA à partir de données publiques. Nous ne collectons aucune donnée personnelle.',
    note_calc: 'Ceci est un simple calculateur — les chiffres ne sont qu’une illustration. Les calculs réels sont bien plus complexes et dépendent de la situation de chaque personne en Belgique. Pour des chiffres réels, contactez le',
    fin_name: 'SPF Finances', fin_url: 'https://finance.belgium.be/fr',
    note_thanks: 'Merci à Ben Patte Folle dont les recherches sur les finances publiques m’ont convaincu de l’utilité de cet outil.',
    other: 'Autres',
  },
  en: {
    skip: 'Skip to content', title: 'Where do my taxes go?',
    nav_home: 'Home', nav_budget: 'Budget', nav_compare: 'Compare', nav_you: 'You', nav_about: 'About',
    compare_h: 'Compare years', compare_sub: 'Change per theme between two years.',
    compare_from: 'From', compare_to: 'To', compare_total: 'Total spending',
    compare_caveat: '⚠️ Big shifts can come from reclassification between departments, not policy. Compare with care.',
    compare_unreliable: '⚠️ A provisional year (2025) is incomplete — the comparison is not reliable.',
    provisional_badge: 'provisional',
    provisional_banner: '⚠️ 2025 is a provisional budget (caretaker government) — figures are incomplete and not comparable.',
    home_kicker: 'Federal budget · Belgium',
    home_q: 'Where do your taxes go?',
    home_lead: 'Belgium’s federal government spent about this in {year}. See where — and what your share is.',
    home_perday: '= {v} per resident, every day',
    hook_label: 'What’s your gross annual income?',
    hook_cta: 'Show my contribution',
    home_explore: 'Explore the budget',
    home_explore_sub: 'Treemap, themes and every line',
    home_you: 'Your contribution',
    home_you_sub: 'See how your tax is split',
    home_levels: 'Who does what', home_levels_sub: 'Federal, region, community, commune',
    levels_h: 'Who does what', levels_sub: 'Four levels of government tax and spend. Tap a level.',
    lvl_taxes: 'Which taxes', lvl_spends: 'What it does', lvl_funding: 'Funding', back_levels: 'All levels',
    stat_total: 'total federal spending', stat_capita: 'per resident / year', stat_day: 'per resident / day',
    budget_h: 'The budget', budget_sub: 'Tap a theme for the explanation, or zoom into the treemap.',
    tm_h: 'At a glance', tm_sub: 'Each block = a spending area. Click to zoom in.',
    cats_h: 'Themes', show_data: 'Show as table (accessible)',
    dt_h: 'All areas', dl_json: 'Download JSON', dl_csv: 'Download CSV',
    th_function: 'Theme', th_amount: 'Amount', th_share: 'Share',
    you_h: 'Your contribution',
    you_sub: 'Enter your gross annual income. We estimate your personal income tax and show how that amount would split in the same proportions as the budget. It’s an illustration — not your exact assessment.',
    db_label: 'Gross annual income',
    bylevel_h: 'Your tax by level', bylevel_sub: 'Pick your commune to split your tax across federal, region and commune.',
    pick_commune: 'Your commune', lvl_federal: 'Federal', lvl_regional: 'Region', lvl_communal: 'Commune',
    communities_note: 'Communities (education, culture) have no own tax — funded from federal money. Estimate; regional share ~25% of income tax.',
    commune_notfound: 'Commune not in the list (tax year 2024, 581 communes; 2025 mergers may be missing). Communal share = 0; federal and region still apply.',
    db_disclaimer: 'Estimate. Federal income tax only (excl. municipal surcharge), simplified (single, no deductions), illustrative.',
    extras_h: 'Other taxes', extras_sub: 'You also pay indirect taxes. Enter your spending and consumption — we work out the tax.',
    tax_vat: 'VAT on everyday spending', tax_insurance: 'Insurance', tax_energy: 'Home energy (gas + electricity)', tax_fuel: 'Fuel', tax_alcohol: 'Alcohol', tax_tobacco: 'Cigarettes',
    info_more: 'More info',
    unit_vat: '€/month', unit_insurance: '€/month', unit_energy: '€/month', unit_fuel: 'liters/month', unit_alcohol: '€/month', unit_tobacco: 'packs/month',
    ex_info_vat: 'Standard VAT is 21%. Enter your everyday spending (rent and energy excluded; food taxed less) — upper estimate.',
    ex_info_insurance: 'Insurance premium tax: 9.25%. Enter your monthly premiums (car, home, etc.).',
    ex_info_energy: 'Your monthly energy bill. ~8% is federal tax (6% VAT + levies); distribution costs are regional.',
    ex_info_fuel: 'Litres of fuel per month. ~€0.90 tax per litre (excise + VAT).',
    ex_info_alcohol: 'Your monthly alcohol budget. ~35% of it is tax (excise + VAT).',
    ex_info_tobacco: 'Packs per month. €13 pack, ~78% is tax.',
    total_contribution: 'Total contribution', of_which_income: 'income tax', of_which_indirect: 'indirect taxes',
    extras_note: 'Estimates: VAT 21% on spending, insurance tax 9.25%, ~8% federal tax on your energy bill, cigarette pack €13 (~78% tax), ~€0.90 per litre of fuel, ~35% of your alcohol budget.',
    tax_est: 'Estimated income tax', your_split: 'split across the budget:',
    per_year: '/year', per_day: '/day', billion: 'bn', million: 'm',
    back_all: 'All themes', of_total: 'of the budget', per_capita: 'per resident',
    cat_covers: 'What it covers', cat_depts: 'Where it goes', cat_your: 'Your contribution to this',
    cat_your_note: 'Based on your income and estimated other taxes. Change it under ‘You’.',
    prev_cat: 'Previous', next_cat: 'Next', to_you: 'Work out your share',
    about_h: 'About', read_caveats: 'Worth knowing',
    sources_h: 'Data sources', sources_sub: 'All data comes from official open-data sources. Links open in a new tab.',
    cv_health: 'Health looks small (1.1%) because health insurance runs through social security — counted under “Social protection”.',
    cv_financing: 'Financing operations (debt rollover and financial transactions) are excluded; only interest counts as a cost.',
    cv_year: 'Only 2023 and 2024 are full years in the open data. 2025 is provisional.',
    cv_estimate: 'The “your contribution” figure is illustrative: amounts scale with income, the proportions are the same for everyone.',
    foot_src: 'Source: data.gov.be — Federal budget (FPS BOSA), licence CC0. Population: Statbel.',
    foot_meta: 'Open data · generated from the official budget · no personal data · icons: Lucide (ISC).',
    note_ai: 'This application was made using AI on public data. We don’t collect any of your personal data.',
    note_calc: 'This is a simple calculator — the figures are only an illustration. Real calculations are far more complex and depend on each person’s situation in Belgium. For real figures, contact',
    fin_name: 'FPS Finance', fin_url: 'https://finance.belgium.be/en',
    other: 'Other',
  },
};
const LOCALE = { nl: 'nl-BE', fr: 'fr-BE', en: 'en-IE' };

// ---------- state ----------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('wtg_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('wtg_' + k, JSON.stringify(v)); } catch {} },
};
let DATA = {};                                   // {year: json}
let lang = store.get('lang', 'nl');
let year = store.get('year', 2024);
let income = store.get('income', 45000);
// indirect taxes — defaults = avg €/resident from FPS Finance 2025 receipts (VAT €3,251, excise €946 split est.)
// All indirect taxes are computed from the user's real monthly spending/consumption.
// VAT default €1,290/mo expenses × 21% ≈ €3,251/yr = the real per-resident VAT average.
const EXTRA_DEF = { vat: { on: true, qty: 1290 }, insurance: { on: false, qty: 0 }, energy: { on: false, qty: 0 }, fuel: { on: false, qty: 0 }, alcohol: { on: false, qty: 0 }, tobacco: { on: false, qty: 0 } };
let extras = (() => { const s = store.get('extras', {}) || {}; const o = {}; for (const k in EXTRA_DEF) o[k] = { ...EXTRA_DEF[k], ...(typeof s[k] === 'object' ? s[k] : {}) }; return o; })();
let cmpA = store.get('cmpA', 2023), cmpB = store.get('cmpB', 2024);
let commune = store.get('commune', '');
let COMMUNES = {};                               // {communeName: additional PIT %} — loaded at boot
const AUTONOMY_FACTOR = 0.25;                     // ≈ share of PIT regionalised (6th State Reform), estimate
let tmPath = [];                                 // treemap drill path (budget view)
let sortKey = 'amount', sortDir = -1;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const t = k => (I18N[lang][k] ?? k);
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
const cur = () => DATA[year];
const labelOf = n => n.label[lang] || n.label.en || n.label.fr || n.label.nl;
// department line items are raw ALL-CAPS admin names → title-case for display
const ACR = new Set(['SPF', 'FOD', 'EU', 'UE', 'ICT', 'OIP', 'ION', 'BOSA', 'R&D', 'RIZIV', 'INAMI', 'F35', 'II', 'III', 'IV', 'V', 'VI']);
const SMALL = new Set(['en', 'et', 'de', 'der', 'des', 'la', 'le', 'du', 'aux', 'à', '&']);
const deptLabel = n => (n.label[lang] || n.label.fr || n.label.nl).toLowerCase().split(/\s+/)
  .map((w, i) => ACR.has(w.toUpperCase()) ? w.toUpperCase() : (i > 0 && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const fmtCur = (eur, dp = 0) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: dp, minimumFractionDigits: dp }).format(eur);
function fmtBig(eur) {
  const nf = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 1 });
  if (Math.abs(eur) >= 1e9) return '€' + nf.format(eur / 1e9) + ' ' + t('billion');
  if (Math.abs(eur) >= 1e6) return '€' + nf.format(eur / 1e6) + ' ' + t('million');
  return fmtCur(eur);
}
const pct = (v, tot) => new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 1 }).format(v / tot * 100) + '%';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function estimateTax(g) {
  const B = [[0, 15820, .25], [15820, 27920, .40], [27920, 48320, .45], [48320, Infinity, .50]];
  let tax = 0; for (const [lo, hi, r] of B) if (g > lo) tax += (Math.min(g, hi) - lo) * r;
  return Math.max(0, tax - 2540);
}
// Belgian tax assumptions (estimates): tax per unit of MONTHLY spending/consumption.
const TOBACCO_PACK = 13, TOBACCO_TAXFRAC = 0.78;   // €13 pack, ~78% tax
// €tax per: € spent (vat 21% standard, alcohol 35% blend) / litre fuel / cigarette pack.
// insurance = 9.25% premium tax (federal); energy ≈ 8% federal tax of bill (6% VAT + federal levies; distribution is regional)
const RATE = { vat: 0.21, insurance: 0.0925, energy: 0.08, fuel: 0.90, alcohol: 0.35, tobacco: TOBACCO_PACK * TOBACCO_TAXFRAC };
const EXTRAS = [
  ['vat', 'tax_vat', { unit: 'unit_vat', step: 50 }],
  ['insurance', 'tax_insurance', { unit: 'unit_insurance', step: 10 }],
  ['energy', 'tax_energy', { unit: 'unit_energy', step: 10 }],
  ['fuel', 'tax_fuel', { unit: 'unit_fuel', step: 5 }],
  ['alcohol', 'tax_alcohol', { unit: 'unit_alcohol', step: 5 }],
  ['tobacco', 'tax_tobacco', { unit: 'unit_tobacco', step: 1 }],
];
function itemTax(k) { const e = extras[k]; return e.on ? (e.qty || 0) * 12 * RATE[k] : 0; }
const extrasTotal = () => EXTRAS.reduce((s, [k]) => s + itemTax(k), 0);
const userTax = () => estimateTax(income) + extrasTotal();
const qtyOut = k => `≈ ${fmtCur(itemTax(k))} ${t('per_year')}`;
const iconSvg = name => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
const fnIcon = id => iconSvg(FN_ICON[id] || 'ellipsis');
const fnChip = (id, cls) => `<span class="chip ${cls}${LIGHT.has(id) ? ' ink-dark' : ''}" style="background:${FN_COLOR[id] || '#5f5f5f'}">${fnIcon(id)}</span>`;
const levelChip = (id, cls = 'card-ic') => `<span class="chip ${cls}" style="background:${LEVELS[id].color}">${iconSvg(LEVELS[id].icon)}</span>`;
const fnById = id => cur().tree.children.find(c => c.id === id);

// ---------- treemap (squarified) ----------
function squarify(items, x, y, w, h) {
  const total = items.reduce((s, d) => s + d.value, 0);
  if (total <= 0 || w <= 0 || h <= 0) return [];
  const scale = (w * h) / total;
  let rest = items.filter(d => d.value > 0).map(d => ({ ref: d, area: d.value * scale }));
  let rect = { x, y, w, h }; const out = [];
  const worst = (row, side) => { const sum = row.reduce((s, r) => s + r.area, 0), mx = Math.max(...row.map(r => r.area)), mn = Math.min(...row.map(r => r.area)), s2 = sum * sum; return Math.max((side * side * mx) / s2, s2 / (side * side * mn)); };
  while (rest.length) {
    const side = Math.min(rect.w, rect.h); let row = [rest[0]], i = 1;
    while (i < rest.length && worst(row, side) >= worst(row.concat(rest[i]), side)) { row.push(rest[i]); i++; }
    const ra = row.reduce((s, r) => s + r.area, 0);
    if (rect.w >= rect.h) { const cw = ra / rect.h; let yy = rect.y; for (const r of row) { const ch = r.area / cw; out.push({ ref: r.ref, x: rect.x, y: yy, w: cw, h: ch }); yy += ch; } rect = { x: rect.x + cw, y: rect.y, w: rect.w - cw, h: rect.h }; }
    else { const rh = ra / rect.w; let xx = rect.x; for (const r of row) { const cw = r.area / rh; out.push({ ref: r.ref, x: xx, y: rect.y, w: cw, h: rh }); xx += cw; } rect = { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh }; }
    rest = rest.slice(row.length);
  }
  return out;
}
const MAX_CELLS = 12;
function aggregateKids(kids) {
  if (kids.length <= MAX_CELLS) return kids;
  const top = kids.slice(0, MAX_CELLS - 1), rest = kids.slice(MAX_CELLS - 1);
  return [...top, { label: { nl: `${t('other')} (${rest.length})`, fr: `${t('other')} (${rest.length})`, en: `${t('other')} (${rest.length})` }, amount: rest.reduce((s, k) => s + k.amount, 0), _other: true }];
}
const rgbHex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const relLum = ([r, g, b]) => { const s = [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * s[0] + .7152 * s[1] + .0722 * s[2]; };
const mixWhite = (rgb, f) => rgb.map(c => Math.round(c + (255 - c) * f));
const pickDarkInk = rgb => { const L = relLum(rgb); return (1.05 / (L + .05)) < ((L + .05) / 0.0685); };
function cellStyle(i, count, isRoot, id) {
  if (isRoot) { const hex = FN_COLOR[id] || '#5f5f5f'; return { bg: hex, dark: LIGHT.has(id) }; }
  const f = count > 1 ? (i / (count - 1)) * 0.45 : 0; const rgb = mixWhite(rgbHex(FN_COLOR[id] || '#5f5f5f'), f);
  return { bg: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, dark: pickDarkInk(rgb) };
}
function renderTreemap() {
  const el = $('#treemap'); if (!el) return; el.innerHTML = '';
  const node = tmPath.length ? tmPath[tmPath.length - 1] : cur().tree;
  const isRoot = tmPath.length === 0;
  const kids = aggregateKids((node.children || []).slice().sort((a, b) => b.amount - a.amount));
  const rect = el.getBoundingClientRect(); const W = Math.max(rect.width, 280), H = Math.max(rect.height, 320);
  const cells = squarify(kids.map(k => ({ value: k.amount, node: k })), 0, 0, W, H);
  const topId = isRoot ? null : tmPath[0].id;
  cells.forEach((c, i) => {
    const k = c.ref.node;
    const drillRoot = isRoot && !k._other;            // root cell → go to category detail
    const drillDept = !isRoot && !!(k.children && k.children.length); // (none at dept level)
    const { bg, dark } = cellStyle(i, cells.length, isRoot, isRoot ? k.id : topId);
    const interactive = drillRoot || drillDept;
    const div = document.createElement(interactive ? 'button' : 'div');
    div.className = 'tm-cell' + (dark ? ' ink-dark' : '') + (interactive ? '' : ' is-leaf');
    div.style.cssText = `left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;background:${bg}`;
    if (c.w > 54 && c.h > 30) {
      const showIc = isRoot && !k._other && c.w > 78 && c.h > 70;
      div.innerHTML = `${showIc ? `<span class="tm-ic">${fnIcon(k.id)}</span>` : ''}<span class="tm-name">${esc(labelOf(k))}</span><span class="tm-val">${fmtBig(k.amount)}</span>`;
    }
    div.title = `${labelOf(k)} — ${fmtBig(k.amount)} (${pct(k.amount, node.amount)})`;
    if (drillRoot) { div.setAttribute('aria-label', `${labelOf(k)}, ${fmtBig(k.amount)}`); div.onclick = () => navigate(`#/category/${k.id}`); }
    el.appendChild(div);
  });
  const tbl = $('#treemap-table');
  if (tbl) { const tot = node.amount; tbl.innerHTML = `<table><thead><tr><th>${t('th_function')}</th><th class="num">${t('th_amount')}</th><th class="num">${t('th_share')}</th></tr></thead><tbody>${(node.children || []).slice().sort((a, b) => b.amount - a.amount).map(k => `<tr><td>${esc(labelOf(k))}</td><td class="num">${fmtBig(k.amount)}</td><td class="num">${pct(k.amount, tot)}</td></tr>`).join('')}</tbody></table>`; }
}

// ---------- count-up ----------
function countUp(el, to) {
  if (reduce) { el.textContent = fmtBig(to); return; }
  const dur = 900, t0 = performance.now();
  const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = fmtBig(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ---------- views ----------
function viewHome() {
  const tot = cur().tree.amount, day = tot / POPULATION / 365;
  return `<section class="screen home">
    <p class="kicker">${t('home_kicker')} · ${year}${cur().provisional ? ` · <span class="badge">${t('provisional_badge')}</span>` : ''}</p>
    <h1 class="home-q">${t('home_q')}</h1>
    <p class="home-big" id="home-big" aria-label="${fmtBig(tot)}">${fmtBig(tot)}</p>
    <p class="home-perday">${fill(t('home_perday'), { v: fmtCur(day, 2) })}</p>
    <p class="home-lead">${fill(t('home_lead'), { year })}</p>
    ${provBannerHtml()}
    <form class="hook" id="hook">
      <label for="hook-inc">${t('hook_label')}</label>
      <div class="hook-row">
        <input id="hook-inc" type="number" inputmode="numeric" min="0" max="500000" step="1000" value="${income}" aria-label="${t('hook_label')}">
        <button type="submit" class="btn-primary">${t('hook_cta')} ${iconSvg('hand-coins')}</button>
      </div>
    </form>
    <div class="entry">
      <a class="entry-card" href="#/budget"><span class="entry-ic">${iconSvg('layout-grid')}</span><span><b>${t('home_explore')}</b><small>${t('home_explore_sub')}</small></span></a>
      <a class="entry-card" href="#/you"><span class="entry-ic">${iconSvg('users')}</span><span><b>${t('home_you')}</b><small>${t('home_you_sub')}</small></span></a>
      <a class="entry-card" href="#/levels"><span class="entry-ic">${iconSvg('landmark')}</span><span><b>${t('home_levels')}</b><small>${t('home_levels_sub')}</small></span></a>
    </div>
  </section>`;
}

function viewBudget() {
  const tot = cur().tree.amount;
  const cards = cur().tree.children.slice().sort((a, b) => b.amount - a.amount).map(fn => {
    const day = fn.amount / POPULATION / 365;
    return `<a class="cat-card" href="#/category/${fn.id}">
      ${fnChip(fn.id, 'card-ic')}
      <span class="cat-meta"><b>${esc(labelOf(fn))}</b><small>${fmtBig(fn.amount)} · ${pct(fn.amount, tot)}</small></span>
      <span class="cat-day">${fmtCur(day, 2)}<small>${t('per_day')}</small></span>
    </a>`;
  }).join('');
  return `<section class="screen">
    <header class="screen-head"><h1>${t('budget_h')}</h1><p class="sub">${t('budget_sub')}</p></header>
    ${provBannerHtml()}
    <div class="card">
      <div class="card-head"><div class="h-row"><span class="h-ic">${iconSvg('layout-grid')}</span><h2>${t('tm_h')}</h2></div></div>
      <p class="sub">${t('tm_sub')}</p>
      <nav class="breadcrumb" id="breadcrumb"></nav>
      <div id="treemap" class="treemap" role="group" aria-label="${t('tm_h')}"></div>
      <details class="data-fallback"><summary>${t('show_data')}</summary><div id="treemap-table"></div></details>
    </div>
    <div class="card-head"><div class="h-row"><span class="h-ic">${iconSvg('table-2')}</span><h2>${t('cats_h')}</h2></div></div>
    <div class="cat-grid">${cards}</div>
    <details class="card data-fallback"><summary>${t('dt_h')}</summary>
      <div class="downloads"><button type="button" id="dl-json">${t('dl_json')}</button><button type="button" id="dl-csv">${t('dl_csv')}</button></div>
      <div class="table-scroll"><table id="data-table"><thead><tr>
        <th data-sort="label" aria-sort="none"><button type="button">${t('th_function')}</button></th>
        <th data-sort="amount" aria-sort="descending" class="num"><button type="button">${t('th_amount')}</button></th>
        <th data-sort="share" aria-sort="none" class="num"><button type="button">${t('th_share')}</button></th>
      </tr></thead><tbody></tbody></table></div>
    </details>
  </section>`;
}

function viewCategory(id) {
  const fn = fnById(id); if (!fn) return viewBudget();
  const tot = cur().tree.amount, c = CONTENT[id] || {};
  const order = cur().tree.children.slice().sort((a, b) => b.amount - a.amount);
  const idx = order.findIndex(x => x.id === id);
  const prev = order[(idx - 1 + order.length) % order.length], next = order[(idx + 1) % order.length];
  const day = fn.amount / POPULATION / 365, capita = fn.amount / POPULATION;
  const yr = userTax() * (fn.amount / tot);
  const kids = (fn.children || []).slice().sort((a, b) => b.amount - a.amount);
  const depts = kids.slice(0, 8).map(d => `<li><span>${esc(deptLabel(d))}</span><b>${fmtBig(d.amount)} <small>${pct(d.amount, fn.amount)}</small></b></li>`).join('');
  const covers = (c.covers?.[lang] || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `<section class="screen cat-detail">
    <nav class="breadcrumb"><a href="#/budget">${t('back_all')}</a><span class="sep">›</span><span class="cur">${esc(labelOf(fn))}</span></nav>
    <header class="cat-hero" style="--cat:${FN_COLOR[id]}">
      ${fnChip(id, 'cat-hero-ic')}
      <h1>${esc(labelOf(fn))}</h1>
      ${c.blurb?.[lang] ? `<p class="cat-blurb">${esc(c.blurb[lang])}</p>` : ''}
    </header>
    <div class="cat-stats">
      <div class="stat"><span class="stat-num">${fmtBig(fn.amount)}</span><span class="stat-lbl">${pct(fn.amount, tot)} ${t('of_total')}</span></div>
      <div class="stat"><span class="stat-num">${fmtCur(capita)}</span><span class="stat-lbl">${t('per_capita')} / ${t('per_year').replace('/', '')}</span></div>
      <div class="stat"><span class="stat-num">${fmtCur(day, 2)}</span><span class="stat-lbl">${t('per_capita')} / ${t('per_day').replace('/', '')}</span></div>
    </div>
    ${covers ? `<div class="card"><div class="h-row"><span class="h-ic">${iconSvg('info')}</span><h2>${t('cat_covers')}</h2></div><ul class="covers">${covers}</ul>${c.note?.[lang] ? `<p class="cat-note">${esc(c.note[lang])}</p>` : ''}</div>` : ''}
    ${kids.length > 1 ? `<div class="card"><div class="h-row"><span class="h-ic">${iconSvg('table-2')}</span><h2>${t('cat_depts')}</h2></div><ul class="dept-list">${depts}</ul></div>` : ''}
    <div class="card your-card">
      <div class="h-row"><span class="h-ic">${iconSvg('hand-coins')}</span><h2>${t('cat_your')}</h2></div>
      <p class="your-amt"><b>${fmtCur(yr)}</b> ${t('per_year')} · ${fmtCur(yr / 365, 2)} ${t('per_day')}</p>
      <p class="sub">${fill(t('cat_your_note'), { inc: fmtCur(income) })} · <a href="#/you">${t('to_you')}</a></p>
    </div>
    <nav class="cat-nav">
      <a class="btn" href="#/category/${prev.id}">‹ ${esc(labelOf(prev))}</a>
      <a class="btn" href="#/category/${next.id}">${esc(labelOf(next))} ›</a>
    </nav>
  </section>`;
}

function extraRow(k, lblKey, opt) {
  const e = extras[k];
  const head = `<span class="extra-head"><label class="extra-tog"><input type="checkbox" data-ex="${k}" ${e.on ? 'checked' : ''}><span>${t(lblKey)}</span></label><button type="button" class="info-btn" data-info="${k}" aria-expanded="false" aria-controls="exinfo-${k}" aria-label="${t('info_more')}">${iconSvg('info')}</button></span>`;
  const ctrl = `<span class="extra-ctrl"><span class="qty-in"><input type="number" inputmode="numeric" class="extra-qty" data-ex="${k}" min="0" step="${opt.step}" value="${e.qty}" aria-label="${t(lblKey)} — ${t(opt.unit)}" ${e.on ? '' : 'disabled'}><span class="unit">${t(opt.unit)}</span></span><output class="extra-out" data-out="${k}">${qtyOut(k)}</output></span>`;
  return `<div class="extra-item"><div class="extra-row">${head}${ctrl}</div><p class="extra-info" id="exinfo-${k}" hidden>${t('ex_info_' + k)}</p></div>`;
}
function viewYou() {
  return `<section class="screen">
    <header class="screen-head"><h1>${t('you_h')}</h1><p class="sub">${t('you_sub')}</p></header>
    ${provBannerHtml()}
    <div class="card">
      <label class="db-label" for="income">${t('db_label')}</label>
      <div class="db-input"><input type="range" id="income" min="0" max="120000" step="1000" value="${income}" aria-describedby="income-out"><output id="income-out" for="income">${fmtCur(income)}</output></div>
      <p class="db-disclaimer">${t('db_disclaimer')}</p>
    </div>
    <div class="card">
      <div class="h-row"><span class="h-ic">${iconSvg('coins')}</span><h2>${t('extras_h')}</h2></div>
      <p class="sub">${t('extras_sub')}</p>
      <div class="extras">${EXTRAS.map(([k, lbl, opt]) => extraRow(k, lbl, opt)).join('')}</div>
      <p class="db-disclaimer">${t('extras_note')}</p>
    </div>
    <div class="card">
      <p class="db-tax" id="db-tax"></p>
      <div id="db-breakdown" class="db-breakdown" role="list"></div>
    </div>
    <div class="card">
      <div class="h-row"><span class="h-ic">${iconSvg('landmark')}</span><h2>${t('bylevel_h')}</h2></div>
      <p class="sub">${t('bylevel_sub')}</p>
      <label class="db-label" for="commune">${t('pick_commune')}</label>
      <input class="commune-in" id="commune" list="communes" value="${esc(commune)}" placeholder="${t('pick_commune')}" autocomplete="off">
      <datalist id="communes">${Object.keys(COMMUNES).sort().map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
      <div id="bylevel"></div>
    </div>
  </section>`;
}

function viewAbout() {
  const li = k => `<li>${t(k)}</li>`;
  return `<section class="screen">
    <header class="screen-head"><h1>${t('about_h')}</h1></header>
    <div class="card about-note" role="note">
      <p>${t('note_ai')}</p>
      <p>${t('note_calc')} <a href="${t('fin_url')}" target="_blank" rel="noopener noreferrer">${t('fin_name')} ↗</a>.</p>
      ${lang === 'fr' ? `<p class="about-thanks">${t('note_thanks')}</p>` : ''}
    </div>
    <div class="card"><div class="h-row"><span class="h-ic">${iconSvg('info')}</span><h2>${t('read_caveats')}</h2></div>
      <ul class="covers">${li('cv_health')}${li('cv_financing')}${li('cv_estimate')}${li('cv_year')}</ul></div>
    <div class="card about-src"><p>${t('foot_src')}</p><p class="foot-meta">${t('foot_meta')}</p>
      <p><a href="#/sources">${t('sources_h')} ›</a></p></div>
  </section>`;
}
function viewSources() {
  return `<section class="screen">
    <header class="screen-head"><h1>${t('sources_h')}</h1><p class="sub">${t('sources_sub')}</p></header>
    <div class="src-list">${SOURCES.map(s => `<a class="src-card" href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="src-meta"><b>${esc(s.name)} ↗</b><small>${esc(s.desc[lang])}</small></span><span class="src-lic">${esc(s.lic)}</span></a>`).join('')}</div>
  </section>`;
}

function provBannerHtml() {
  return cur().provisional ? `<p class="provbanner" role="note">${t('provisional_banner')}</p>` : '';
}

function viewLevels() {
  const cards = LEVEL_IDS.map(id => {
    const L = LEVELS[id];
    return `<a class="cat-card level-card" href="#/level/${id}">${levelChip(id)}<span class="cat-meta"><b>${esc(L.label[lang])}</b><small>${esc(L.blurb[lang])}</small></span></a>`;
  }).join('');
  return `<section class="screen">
    <header class="screen-head"><h1>${t('levels_h')}</h1><p class="sub">${t('levels_sub')}</p></header>
    <div class="cat-grid">${cards}</div>
  </section>`;
}
function viewLevel(id) {
  const L = LEVELS[id]; if (!L) return viewLevels();
  const list = arr => arr.map(x => `<li>${esc(x)}</li>`).join('');
  const idx = LEVEL_IDS.indexOf(id), prev = LEVELS[LEVEL_IDS[(idx + 3) % 4]], next = LEVELS[LEVEL_IDS[(idx + 1) % 4]];
  return `<section class="screen cat-detail">
    <nav class="breadcrumb"><a href="#/levels">${t('back_levels')}</a><span class="sep">›</span><span class="cur">${esc(L.label[lang])}</span></nav>
    <header class="cat-hero" style="--cat:${L.color}">${levelChip(id, 'cat-hero-ic')}<h1>${esc(L.label[lang])}</h1><p class="cat-blurb">${esc(L.blurb[lang])}</p></header>
    <div class="card"><div class="h-row"><span class="h-ic">${iconSvg('banknote')}</span><h2>${t('lvl_taxes')}</h2></div><ul class="covers${L.noTax ? ' covers-none' : ''}">${list(L.taxes[lang])}</ul></div>
    <div class="card"><div class="h-row"><span class="h-ic">${iconSvg('layout-grid')}</span><h2>${t('lvl_spends')}</h2></div><ul class="covers">${list(L.spends[lang])}</ul></div>
    <div class="card"><div class="h-row"><span class="h-ic">${iconSvg('info')}</span><h2>${t('lvl_funding')}</h2></div><p class="cat-note">${esc(L.funding[lang])}</p></div>
    <nav class="cat-nav"><a class="btn" href="#/level/${LEVEL_IDS[(idx + 3) % 4]}">‹ ${esc(prev.label[lang])}</a><a class="btn" href="#/level/${LEVEL_IDS[(idx + 1) % 4]}">${esc(next.label[lang])} ›</a></nav>
  </section>`;
}

const nf1 = n => new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 1 }).format(n);
const dCls = d => d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
function deltaStr(d, p) {
  const arrow = d > 0 ? '▲' : d < 0 ? '▼' : '=';
  const pstr = p == null ? '—' : (d > 0 ? '+' : '') + nf1(p) + '%';
  const astr = (d > 0 ? '+' : d < 0 ? '−' : '') + fmtBig(Math.abs(d));
  return `${arrow} ${pstr} <small>${astr}</small>`;
}
function yearBtns(sel) {
  return YEARS.map(y => `<button type="button" data-y="${y}" aria-pressed="${y === sel}">${y}${DATA[y]?.provisional ? `<span class="seg-badge">*</span>` : ''}</button>`).join('');
}
function viewCompare() {
  const a = DATA[cmpA], b = DATA[cmpB];
  const rows = b.tree.children.map(fn => {
    const av = a.tree.children.find(x => x.id === fn.id)?.amount || 0, bv = fn.amount, d = bv - av;
    return { id: fn.id, name: labelOf(fn), av, bv, d, p: av > 0 ? d / av * 100 : null };
  }).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  const ta = a.tree.amount, tb = b.tree.amount, td = tb - ta, tp = ta > 0 ? td / ta * 100 : null;
  const prov = a.provisional || b.provisional;
  return `<section class="screen">
    <header class="screen-head"><h1>${t('compare_h')}</h1><p class="sub">${t('compare_sub')}</p></header>
    <div class="card cmp-pick">
      <div class="cmp-pick-row"><span>${t('compare_from')}</span><div class="yearseg" id="cmpA">${yearBtns(cmpA)}</div></div>
      <div class="cmp-pick-row"><span>${t('compare_to')}</span><div class="yearseg" id="cmpB">${yearBtns(cmpB)}</div></div>
    </div>
    ${prov ? `<p class="provbanner" role="note">${t('compare_unreliable')}</p>` : ''}
    <p class="provbanner" role="note">${t('compare_caveat')}</p>
    <div class="card cmp-total"><span>${t('compare_total')}</span><b>${fmtBig(ta)} → ${fmtBig(tb)}</b><span class="cmp-delta ${dCls(td)}">${deltaStr(td, tp)}</span></div>
    <div class="cmp-list">${rows.map(r => `<a class="cmp-row" href="#/category/${r.id}">${fnChip(r.id, 'db-ic')}<span class="cmp-name"><b>${esc(r.name)}</b><small>${fmtBig(r.av)} → ${fmtBig(r.bv)}</small></span><span class="cmp-delta ${dCls(r.d)}">${deltaStr(r.d, r.p)}</span></a>`).join('')}</div>
  </section>`;
}
function mountCompare() {
  // update in place + keep keyboard focus on the chosen button (no route re-announce)
  const wire = (sel, assign) => $(sel)?.querySelectorAll('button').forEach(btn => btn.onclick = () => {
    assign(+btn.dataset.y); $('#view').innerHTML = viewCompare(); mountCompare();
    $(`${sel} button[data-y="${btn.dataset.y}"]`)?.focus();
  });
  wire('#cmpA', v => { cmpA = v; store.set('cmpA', v); });
  wire('#cmpB', v => { cmpB = v; store.set('cmpB', v); });
}

// ---------- mounts (post-insert wiring) ----------
function mountBudget() {
  tmPath = []; renderBreadcrumb(); renderTreemap(); renderTable();
  $('#dl-json')?.addEventListener('click', () => download(`federal-${year}.json`, JSON.stringify(cur(), null, 2), 'application/json'));
  $('#dl-csv')?.addEventListener('click', () => {
    const tot = cur().tree.amount;
    const csv = ['function_id,label_en,amount_eur,share_pct', ...cur().tree.children.map(f => `${f.id},${csvCell(f.label.en)},${f.amount},${(f.amount / tot * 100).toFixed(2)}`)].join('\n');
    download(`federal-${year}.csv`, csv, 'text/csv');
  });
  document.querySelectorAll('#data-table th').forEach(th => th.querySelector('button').addEventListener('click', () => { const k = th.dataset.sort; if (k === sortKey) sortDir *= -1; else { sortKey = k; sortDir = k === 'label' ? 1 : -1; } renderTable(); }));
  let raf; const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderTreemap); }); ro.observe($('#treemap'));
}
function renderBreadcrumb() {
  const bc = $('#breadcrumb'); if (!bc) return; bc.innerHTML = '';
  const mk = (txt, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.onclick = fn; return b; };
  bc.appendChild(mk(t('back_all'), () => { tmPath = []; renderBreadcrumb(); renderTreemap(); }));
  tmPath.forEach((n, i) => { const s = document.createElement('span'); s.className = 'sep'; s.textContent = '›'; bc.appendChild(s); const last = i === tmPath.length - 1; if (last) { const c = document.createElement('span'); c.className = 'cur'; c.textContent = labelOf(n); bc.appendChild(c); } else bc.appendChild(mk(labelOf(n), () => { tmPath = tmPath.slice(0, i + 1); renderBreadcrumb(); renderTreemap(); })); });
}
function renderTable() {
  const tb = $('#data-table tbody'); if (!tb) return; const tot = cur().tree.amount;
  const rows = cur().tree.children.map(fn => ({ id: fn.id, label: labelOf(fn), amount: fn.amount, share: fn.amount / tot }));
  rows.sort((a, b) => sortKey === 'label' ? a.label.localeCompare(b.label, LOCALE[lang]) * sortDir : (a[sortKey] - b[sortKey]) * sortDir);
  tb.innerHTML = rows.map(r => `<tr><td><a class="td-lbl" href="#/category/${r.id}">${fnChip(r.id, 'cell-ic')}${esc(r.label)}</a></td><td class="num">${fmtBig(r.amount)}</td><td class="num">${pct(r.amount, tot)}</td></tr>`).join('');
  document.querySelectorAll('#data-table th').forEach(th => th.setAttribute('aria-sort', th.dataset.sort === sortKey ? (sortDir < 0 ? 'descending' : 'ascending') : 'none'));
}
function mountYou() {
  const inp = $('#income');
  inp.addEventListener('input', () => { income = +inp.value; store.set('income', income); $('#income-out').textContent = fmtCur(income); renderBreakdown(); });
  document.querySelectorAll('.extra-qty').forEach(q => q.addEventListener('input', () => {
    extras[q.dataset.ex].qty = Math.max(0, +q.value || 0); store.set('extras', extras);
    document.querySelector(`.extra-out[data-out="${q.dataset.ex}"]`).textContent = qtyOut(q.dataset.ex); renderBreakdown();
  }));
  document.querySelectorAll('input[type=checkbox][data-ex]').forEach(c => c.addEventListener('change', () => {
    const k = c.dataset.ex; extras[k].on = c.checked; store.set('extras', extras);
    const ctrl = document.querySelector(`.extra-qty[data-ex="${k}"]`); if (ctrl) ctrl.disabled = !c.checked;
    document.querySelector(`.extra-out[data-out="${k}"]`).textContent = qtyOut(k);
    renderBreakdown();
  }));
  document.querySelectorAll('.info-btn').forEach(b => b.addEventListener('click', () => {
    const p = document.getElementById('exinfo-' + b.dataset.info), open = p.hasAttribute('hidden');
    p.toggleAttribute('hidden', !open); b.setAttribute('aria-expanded', String(open));
  }));
  const cm = $('#commune'); if (cm) cm.addEventListener('input', () => { commune = cm.value.trim(); store.set('commune', commune); renderByLevel(); });
  renderBreakdown();
}
function renderBreakdown() {
  const tot = cur().tree.amount, inc = estimateTax(income), ex = extrasTotal(), tax = inc + ex;
  $('#db-tax').innerHTML = `${t('total_contribution')}: <strong>${fmtCur(tax)}</strong> <small>(${t('of_which_income')} ${fmtCur(inc)} + ${t('of_which_indirect')} ${fmtCur(ex)})</small> — ${t('your_split')}`;
  const box = $('#db-breakdown'); box.innerHTML = '';
  cur().tree.children.slice().sort((a, b) => b.amount - a.amount).forEach(fn => {
    const share = fn.amount / tot, yr = tax * share;
    const row = document.createElement('a'); row.className = 'db-row'; row.href = `#/category/${fn.id}`; row.setAttribute('role', 'listitem');
    row.innerHTML = `${fnChip(fn.id, 'db-ic')}<span class="db-name"><b>${esc(labelOf(fn))}</b><span class="db-bar"><i style="width:${(share * 100).toFixed(1)}%;background:${FN_COLOR[fn.id]}"></i></span></span><span class="db-val">${fmtCur(yr)} <small>${t('per_year')}</small> · ${fmtCur(yr / 365, 2)} <small>${t('per_day')}</small></span>`;
    box.appendChild(row);
  });
  renderByLevel();
}
function byLevel() {
  const inc = estimateTax(income), ex = extrasTotal();
  const pctC = (commune && COMMUNES[commune]) || 0;
  const communal = inc * pctC / 100, regional = inc * AUTONOMY_FACTOR, federal = inc * (1 - AUTONOMY_FACTOR) + ex;
  return { federal, regional, communal, total: federal + regional + communal };
}
function renderByLevel() {
  const el = $('#bylevel'); if (!el) return;
  const L = byLevel(), tot = L.total || 1;
  const seg = [['lvl_federal', L.federal, '#c8102e'], ['lvl_regional', L.regional, '#1d3461'], ['lvl_communal', L.communal, '#007068']];
  const notfound = commune && !(commune in COMMUNES) ? `<p class="provbanner" role="note">${t('commune_notfound')}</p>` : '';
  el.innerHTML = `${notfound}<div class="lvlbar" role="img" aria-label="${seg.map(([k, v]) => `${t(k)} ${pct(v, tot)}`).join(', ')}">${seg.map(([k, v, c]) => `<span style="width:${(v / tot * 100).toFixed(1)}%;background:${c}"></span>`).join('')}</div>
    <ul class="lvl-legend">${seg.map(([k, v, c]) => `<li><span class="sw" style="background:${c}"></span>${t(k)}<b>${fmtCur(v)}</b><small>${pct(v, tot)}</small></li>`).join('')}</ul>
    <p class="db-disclaimer">${t('communities_note')}</p>`;
}
function mountHome() {
  countUp($('#home-big'), cur().tree.amount);
  $('#hook').addEventListener('submit', e => { e.preventDefault(); income = Math.max(0, +$('#hook-inc').value || 0); store.set('income', income); navigate('#/you'); });
}

// ---------- downloads ----------
function download(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
const csvCell = s => '"' + String(s).replace(/"/g, '""') + '"';

// ---------- router ----------
const ROUTES = { '': { fn: viewHome, mount: mountHome, key: 'nav_home' }, budget: { fn: viewBudget, mount: mountBudget, key: 'nav_budget' }, category: { fn: viewCategory, mount: () => {}, key: 'nav_budget' }, levels: { fn: viewLevels, mount: () => {}, key: 'nav_home' }, level: { fn: viewLevel, mount: () => {}, key: 'nav_home' }, compare: { fn: viewCompare, mount: mountCompare, key: 'nav_compare' }, you: { fn: viewYou, mount: mountYou, key: 'nav_you' }, about: { fn: viewAbout, mount: () => {}, key: 'nav_about' }, sources: { fn: viewSources, mount: () => {}, key: 'nav_about' } };
function parseHash() { const h = location.hash.replace(/^#\/?/, '').split('/'); return { view: h[0] || '', id: h[1] || '' }; }
function navigate(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function render() {
  const run = () => {
    const { view, id } = parseHash(); const r = ROUTES[view] || ROUTES[''];
    const el = $('#view'); el.innerHTML = r.fn(id); r.mount(id);
    const h1 = el.querySelector('h1');
    document.title = (h1 ? h1.textContent + ' — ' : '') + t('title');
    document.querySelectorAll('#tabbar a').forEach(a => a.setAttribute('aria-current', a.dataset.key === r.key ? 'page' : 'false'));
    (h1 || el).setAttribute('tabindex', '-1'); (h1 || el).focus({ preventScroll: false });
    $('#route-status').textContent = (h1?.textContent || '') + ' — ' + t('title');
    window.scrollTo(0, 0);
  };
  if (document.startViewTransition && !reduce) document.startViewTransition(run); else run();
}

// ---------- chrome ----------
function renderChrome() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  // year segmented control
  $('#yearseg').innerHTML = YEARS.map(y => `<button type="button" data-year="${y}" aria-pressed="${y === year}">${y}${DATA[y]?.provisional ? `<span class="seg-badge" title="${t('provisional_badge')}">*</span>` : ''}</button>`).join('');
  $('#yearseg').querySelectorAll('button').forEach(b => b.onclick = () => { year = +b.dataset.year; store.set('year', year); tmPath = []; renderChrome(); render(); });
  // tabbar
  $('#tabbar').innerHTML = [['', 'nav_home', 'house'], ['budget', 'nav_budget', 'layout-grid'], ['compare', 'nav_compare', 'arrow-left-right'], ['you', 'nav_you', 'hand-coins'], ['about', 'nav_about', 'info']]
    .map(([v, k, ic]) => `<a href="#/${v}" data-key="${k}">${iconSvg(ICONS[ic] ? ic : 'info')}<span>${t(k)}</span></a>`).join('');
}

// ---------- boot ----------
async function loadAll() {
  if (globalThis.__DATA__) return globalThis.__DATA__;
  const out = {}; await Promise.all(YEARS.map(async y => { out[y] = await (await fetch(`data/federal-${y}.json`)).json(); }));
  return out;
}
async function boot() {
  try { DATA = await loadAll(); if (!DATA[year]?.tree) year = 2024; if (!DATA[year]?.tree) throw 0; }
  catch { document.querySelector('#view').innerHTML = `<p role="alert" class="card" style="border-color:var(--be-red)">⚠️ ${t('cv_year') || 'Data could not be loaded.'}</p>`; return; }
  try { COMMUNES = globalThis.__COMMUNES__ || await (await fetch('data/communal-pit.json')).json(); } catch { COMMUNES = {}; }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; store.set('lang', lang); renderChrome(); render(); }));
  $('#brand-home').addEventListener('click', () => navigate('#/'));
  window.addEventListener('hashchange', render);
  renderChrome();
  render();
}
boot();
