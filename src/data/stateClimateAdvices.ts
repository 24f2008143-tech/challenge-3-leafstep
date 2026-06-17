export interface StateRecommendation {
  title: string;
  potential: string;
  iconType: "sun" | "wind" | "battery" | "leaf" | "industrial" | "zap" | "activity";
  strategies: string[];
  individualActions?: string[];
  warnings?: string[];
  peakHours?: string;
}

export const STATE_DECARBONIZATION_GUIDE: Record<string, StateRecommendation> = {
  "Maharashtra": {
    title: "Eco-Industrial Transition & Hybrid Storage",
    potential: "High wind-solar resource & major commercial loads",
    iconType: "industrial",
    strategies: [
      "Incentivize grid-battery backup (BESS) for heavy manufacturing hubs in Pune, Thane & Nagpur.",
      "Deploy rooftop solar mandates on industrial facilities exceeding 500 kW connected load.",
      "Retrofit coal-fired thermal blocks with super-critical heat exchange & waste heat recovery units."
    ],
    individualActions: [
        "Opt into time-of-use (ToU) electricity tariffs if available from utility providers.",
        "Use smart-plugs to schedule heavy appliance usage (e.g., washing machines) during day-time solar surplus."
    ],
    warnings: [
        "Avoid running all heavy appliances simultaneously during early evening peak demand hours (6 PM - 9 PM).",
        "Do not overload circuits with high-wattage heating appliances during peak load periods."
    ]
  },
  "Delhi": {
    title: "Urban Fleet Electrification & Cooling Efficiency",
    potential: "Enormous commercial/residential peak cooling demand",
    iconType: "zap",
    strategies: [
      "Accelerate public EV charging infrastructure and transition last-mile logistics 100% to clean fleets.",
      "Enforce mandatory thermal insulation and cool-roof reflective coatings on high-rise layouts.",
      "Implement district water-based cooling networks in central business areas to curb peaking cooling load."
    ],
    individualActions: [
        "Use public transport and EV rickshaws for short trips to reduce congestion.",
        "Set AC temperatures to 24-26°C and use ceiling fans to circulate air efficiently."
    ],
    warnings: [
        "Avoid using high-emission diesel generators during power cuts.",
        "Do not leave appliances on standby mode as it contributes to passive load."
    ]
  },
  "Karnataka": {
    title: "Wind-Solar Hybrids & Agricultural Solarization",
    potential: "Abundant wind-rich ridges and high farming pumpsets",
    iconType: "wind",
    strategies: [
      "Install wind-solar co-located hybrid systems in Chitradurga and Bellary to steady grid imports.",
      "Accelerate PM-KUSUM implementation to power irrigation pumps with localized solar microgrids.",
      "Upgrade Southern Grid inter-connections to export surplus wind power during monsoon peaks."
    ],
    individualActions: [
        "Switch to solar pumps for agriculture where feasible.",
        "Utilize smart irrigation systems to minimize unnecessary power usage by pumps."
    ],
    warnings: [
        "Avoid running heavy machinery during peak wind fluctuations.",
        "Do not perform unauthorized modifications to solar pump setups."
    ]
  },
  "Gujarat": {
    title: "Mega Renewable Parks & Green Hydrogen Feedstock",
    potential: "World-class solar desert land and extensive chemical parks",
    iconType: "sun",
    strategies: [
      "Fast-track mega-watt wind/solar arrays inside the Khavda Renewable Energy Zone.",
      "Transition steel, petrochemical & fertilizer complexes to green-hydrogen burning furnaces.",
      "Implement shore-to-ship power configurations across major ports like Kandla and Mundra."
    ],
    individualActions: [
        "Install solar water heaters for residential use.",
        "Reduce high-wattage water heating by using solar thermal alternatives."
    ],
    warnings: [
        "Avoid heavy grid usage during peak solar noon if you have rooftop solar; export back instead.",
        "Do not tamper with industrial solar connections if present in your locale."
    ]
  },
  "Tamil Nadu": {
    title: "Offshore Wind Conduits & Smart Grid Balancing",
    potential: "Strong coastal wind speeds & high manufacturing load",
    iconType: "wind",
    strategies: [
      "Initiate shallow offshore wind turbine deployment off the Gulf of Mannar.",
      "Establish regional energy-storage units (BESS) to capture late-night wind peaks securely.",
      "Establish active demand-response networks for textile and automobile plants."
    ],
    individualActions: [
        "Use energy-efficient lighting and fans.",
        "Switch to wind-based power providers if available for residential supply."
    ],
    warnings: [
        "Avoid intensive appliance usage during low-wind periods if the grid relies heavily on wind.",
        "Do not interfere with local wind turbine infrastructure."
    ]
  },
  "Uttar Pradesh": {
    title: "Biomass Co-Firing & Rural Microgrids",
    potential: "High agricultural biomass yield & large rural population",
    iconType: "leaf",
    strategies: [
      "Enforce 10% crop-residue pellet co-firing in coal-fired power stations to reduce stubble burning.",
      "Spur decentralized solar mini-grids in rural regions to retire portable diesel generators.",
      "Retrofit the massive state pump-irrigation networks with energy-efficient variable-frequency drives."
    ],
    individualActions: [
        "Switch to biomass-based cooking solutions for rural households.",
        "Use solar lanterns and small PV light setups."
    ],
    warnings: [
        "Avoid burning crop residues as it is a major emission source.",
        "Do not rely solely on diesel for rural power generation."
    ]
  },
  "West Bengal": {
    title: "Thermal Modernization & Pumped Hydro Backing",
    potential: "Large base of sub-critical coal power & hilly reservoirs",
    iconType: "activity",
    strategies: [
      "Phasewise retire subcritical thermal stations over 25 years old in favor of clean hydro/solar.",
      "Fast-track Purulia Pumped Storage projects to cushion peak loads during solar downtime.",
      "Incentivize electrification of tea factories using green microgrids in the Darjeeling heights."
    ],
    individualActions: [
      "Shift heavy loads such as water heaters to late morning hours when solar generation peaks.",
      "Switch all household lighting to energy-efficient LEDs."
    ],
    warnings: [
      "Avoid using air conditioning during the 7 PM - 10 PM peak load time.",
      "Do not leave appliances on standby mode as it consumes passive energy."
    ]
  },
  "Andhra Pradesh": {
    title: "Pumped Hydro Storage & Floating Solar Arrays",
    potential: "Ideal topography for pumped storage and wide reservoirs",
    iconType: "battery",
    strategies: [
      "Develop large pumped hydro systems to store excess day solar and feed peak evening loads.",
      "Deploy floating solar panels on multi-purpose irrigation reservoirs (decrease evaporation).",
      "Transition brackish aquaculture ponds and cold chains to localized clean solar setups."
    ],
    individualActions: [
      "Install solar water heaters to reduce reliance on grid power for hot water.",
      "Utilize smart irrigation systems if operating a home farm or garden to optimize water and power."
    ],
    warnings: [
      "Avoid running heavy water pumps during electricity peak demand hours.",
      "Do not tamper with community or reservoirs-based floating solar infrastructure."
    ]
  },
  "Telangana": {
    title: "C&I Solar Rooftops & EV Expressway Corridors",
    potential: "Intense industrial focus & tech hub energy consumption",
    iconType: "zap",
    strategies: [
      "Incentivize tech hubs in Hyderabad to purchase 100% clean green power under open-access systems.",
      "Mandate dynamic charging zones and clean solar storage networks along major national highways.",
      "Deploy distributed solar-storage setups across government facilities & schools."
    ],
    individualActions: [
      "Optimize smart home settings to manage air conditioning dynamically.",
      "Utilize public EV charging hubs instead of home-charging during peak evening hours."
    ],
    warnings: [
      "Avoid rapid charging of EVs during peak evening hours if not strictly necessary.",
      "Do not bypass energy meters or load controllers in commercial or residential buildings."
    ]
  },
  "Madhya Pradesh": {
    title: "Solar Park Expansion & Feeder Separation",
    potential: "Vast sunshine areas & intensive farming grid load",
    iconType: "sun",
    strategies: [
      "Expand the high-capacity Rewa Solar project and establish modular solar hubs on arid lands.",
      "Complete the agricultural feeder segregation, backing solarized feeders for daytime power.",
      "Reduce transmission line losses by upgrading suburban networks to high-voltage lines."
    ]
  },
  "Rajasthan": {
    title: "HVDC Corridors & Sand-Thermal Geostorage",
    potential: "Highest solar irradiance in India & huge desert tracts",
    iconType: "sun",
    strategies: [
      "Develop ultra-high-voltage DC (UHVDC) lines to cross-country transmit desert solar to northern cities.",
      "Implement advanced sand-based thermal heat storage buffers near heavy grid substations.",
      "Equip isolated water wells with standard solar-pumping arrays to eliminate diesel transport."
    ]
  },
  "Punjab": {
    title: "Stubble-to-Biogas Conversion & Crop Solarization",
    potential: "Immense crop residue biomass & intensive tubewell density",
    iconType: "leaf",
    strategies: [
      "Build village-level stubble collection rings and compress raw bio-waste into carbon-neutral biogas.",
      "Incentivize direct grid-connected farm solar pumps, paying farmers back for surplus clean energy.",
      "Implement strict modern energy efficiency goals for small-to-medium steel recycling foundries."
    ]
  },
  "Haryana": {
    title: "Smart Grid Infrastructures & High-Rise Green Audits",
    potential: "Dense commercial districts (Gurugram) & light industry",
    iconType: "activity",
    strategies: [
      "Establish automated smart grids in Gurgaon to balance office loads with flexible billing.",
      "Retrofit heavy industrial boilers in Faridabad to burn compressed agricultural bio-pellets.",
      "Mandate grid-interactive solar roofs on commercial structures with plot sizes over 500 yards."
    ]
  },
  "Bihar": {
    title: "Clean Grid Retrofits & Solar Water Pumping",
    potential: "Fertile alluvial plains & expanding electricity demand",
    iconType: "leaf",
    strategies: [
      "Accelerate grid lines upgrades to minimize local Transmission and Distribution (T&D) losses.",
      "Install solar micro-grids to power essential rural health and educational services.",
      "Convert heavy diesel agri-pumps to clean solar-pumping systems."
    ]
  },
  "Jharkhand": {
    title: "Mining Machine Electrification & Hydrogen Steel",
    potential: "High mineral wealth & coal-intensive heavy metal units",
    iconType: "industrial",
    strategies: [
      "Transition high-capacity draglines and coal transport conveyors to electric lines.",
      "Incentivize local steel and aluminum boilers to utilize clean hydrogen gas mix.",
      "Reclaim abandoned heavy mines with solar parks to revitalize local land."
    ]
  },
  "Odisha": {
    title: "Smelter Decarbonization & Coastal Wind Energy",
    potential: "Major aluminum refining hub & long coastline",
    iconType: "wind",
    strategies: [
      "Introduce renewable energy power agreements (PPA) for aluminum smelting fields.",
      "Leverage offshore and onshore wind potentials along Puri and Ganjam coastal lines.",
      "Install high-efficiency solar microgrids for isolated coastal fishing villages."
    ]
  },
  "Chhattisgarh": {
    title: "Residue Co-Firing & FGD Upgradings",
    potential: "Abundant coal power stations & thick agriculture yield",
    iconType: "leaf",
    strategies: [
      "Retrofit older thermal boilers with Flue Gas Desulfurization (FGD) systems to curb emissions.",
      "Blend local crop husks as a 10% burning element inside state-owned power generators.",
      "Harness rooftop solar systems across dense steel rolling clusters."
    ]
  },
  "Jammu & Kashmir": {
    title: "Mini Run-of-the-River Hydel & Thermal Solar",
    potential: "Steep mountain streams & cold-climate heating need",
    iconType: "battery",
    strategies: [
      "Build eco-sensitive small hydel stations (run-of-the-river) with minimal forest footprint.",
      "Provide solar water heaters and passive thermal architecture plans to mountain households.",
      "Electrify valley transport and tourist boat grids with grid batteries."
    ]
  },
  "Himachal Pradesh": {
    title: "Hydro Reservoir Stabilization & Clean Eco-Tourism",
    potential: "Tremendous clean hydro reserves & tourism fleets",
    iconType: "zap",
    strategies: [
      "Develop hydro cascade optimization algorithms to regulate water releases dynamically.",
      "Mandate all public resort and hotel heating to transition to electric heating/heat pumps.",
      "Build fast-charging EV depots in tourist centers powered by clean run-of-river generators."
    ]
  },
  "Uttarakhand": {
    title: "Run-of-River Hydro & Decentralized Mountain Grids",
    potential: "High high-head water streams and isolated hamlets",
    iconType: "battery",
    strategies: [
      "Construct small run-of-the-river hydel grids to serve isolated high-altitude settlements.",
      "Implement solar-battery smart microgrids for offgrid eco-resorts and mountain homestays.",
      "Promote green building standards with natural insulation in cold-climate regions."
    ]
  },
  "Kerala": {
    title: "Floating Reservoir Solar & Prosumer Rooftops",
    potential: "High seasonal monsoon rainfall & high water coverage",
    iconType: "leaf",
    strategies: [
      "Deploy floating solar panels on reservoir and backwater surfaces to preserve drinking water.",
      "Implement attractive feed-in tariffs for residential rooftop solar with local battery buffers.",
      "Electrify inland ferry transport systems completely using solar-hybrid motors."
    ]
  },
  "Goa": {
    title: "Green Tourist Portals & Clean Coastal Mini-Grids",
    potential: "Solar-rich beaches & compact transit patterns",
    iconType: "leaf",
    strategies: [
      "Mandate zero-emission electric scooter and car rentals for tourists across all beaches.",
      "Incentivize beach front hotels to transition to solar-plus-storage minigrids.",
      "Electrify coastal cruise vessels using shore-based clean power hookups."
    ]
  },
  "Assam": {
    title: "Tea Garden Solarization & Biogas Boilers",
    potential: "Massive tea plantations & agricultural waste",
    iconType: "leaf",
    strategies: [
      "Electrify tea factory motors and processing boilers using solar-biomass hybrid systems.",
      "Install solar hybrid configurations on isolated river islands (Char islands) to phase out diesel.",
      "Introduce bio-methane digesters using municipal organic waste."
    ]
  },
  "Sikkim": {
    title: "Organic-Waste Bio-Synthesizers & Solar Microgrids",
    potential: "Fully organic state & rich run-of-the-river hydel background",
    iconType: "leaf",
    strategies: [
      "Leverage organic waste to produce compressed biogas for cooking and hotel heating.",
      "Boost local run-of-the-river hydel backing during winter dry periods using solar microgrids.",
      "Mandate green star ratings for all new hotel constructions and tourist infrastructure."
    ]
  },
  "Tripura": {
    title: "Gas-Turbine Hybrid Efficiency & Solar Pumps",
    potential: "Moderate natural gas assets & farming population",
    iconType: "zap",
    strategies: [
      "Retrofit older thermal gas plants to gas-solar thermodynamic hybrids to raise efficiency.",
      "Introduce portable containerized solar water pump sets for marginal multi-crop farms.",
      "Enforce grid upgrades to scale back-feed power from rooftop systems."
    ]
  },
  "Meghalaya": {
    title: "Bamboo-Biomass Gasification & Small Hydel Care",
    potential: "Extensive bamboo forests & high annual rainfall streams",
    iconType: "leaf",
    strategies: [
      "Develop local bamboo and agricultural waste pelletizers for rural electrification grid units.",
      "Restore old sub-MW small hydel systems to supply reliable power to remote villages.",
      "Incentivize local limestone kilns to transition to eco-friendly electric furnaces."
    ]
  },
  "Manipur": {
    title: "Community Micro-grids & Solar Agribusiness",
    potential: "Isolated mountain hamlets & diverse crop yields",
    iconType: "sun",
    strategies: [
      "Deploy localized solar-plus-storage mini-grids to power hill village centers.",
      "Equip local agricultural grain dryers and post-harvest facilities with solar thermal heating.",
      "Transition remote river water lifts to clean electricity grids."
    ]
  },
  "Nagaland": {
    title: "Forest Biomass Gasifiers & Hydel Microgrids",
    potential: "Vast community forests & mountainous terrain",
    iconType: "wind",
    strategies: [
      "Deploy high-efficiency biomass gasifiers utilizing forest residue for village microgrids.",
      "Implement eco-sensitive small run-of-the-river hydel generators to replace diesel sets.",
      "Incentivize sustainable eco-resort building materials with self-contained solar batteries."
    ]
  },
  "Mizoram": {
    title: "Mountain Hydel Feeders & Solar Cold Chains",
    potential: "High mountain drops & agricultural isolation",
    iconType: "battery",
    strategies: [
      "Construct small hydel grid feeders along mountain streams for stable village loop power.",
      "Support standard solar-refrigerated cold storage rooms for organic fruits and floriculture.",
      "Implement residential rooftop PV programs with dynamic battery integration."
    ]
  },
  "Arunachal Pradesh": {
    title: "Eco-Hydel Microgrids & Solar Lifeline Backups",
    potential: "Massive run-of-river capacity & highly isolated valleys",
    iconType: "battery",
    strategies: [
      "Leverage micro run-of-river hydro loops to supply year-round power to frontier districts.",
      "Install solar solar backup storage setups at remote medical and communication posts.",
      "Support local bamboo and wood-waste gasification machines for regional craft units."
    ]
  },
  "Chandigarh": {
    title: "100% Rooftop Solar & Municipal Fleet Transition",
    potential: "Clean-planned urban layout & public administration assets",
    iconType: "sun",
    strategies: [
      "Mandate solar roofs on all government offices, schools, and grid pumping stations.",
      "Transition urban municipal buses and utility waste-trucks to battery electric power.",
      "Establish active neighborhood battery banks to smooth commercial center peaks."
    ]
  },
  "Puducherry": {
    title: "Coastal Battery Storage & Electric Transit Fleet",
    potential: "Compact urban structure & solar marine conditions",
    iconType: "zap",
    strategies: [
      "Deploy localized battery storage units (BESS) next to grid distribution substations.",
      "Provide subsidies to transition all city auto-rickshaws to clean battery-electric models.",
      "Incentivize coastal hotels to run high-efficiency solar water heating systems."
    ]
  },
  "Lakshadweep": {
    title: "Diesel Retirement & Containerized Solar-BESS",
    potential: "Abundant ocean sun & urgent need to retire heavy diesel power",
    iconType: "sun",
    strategies: [
      "Replace expensive ship-transported diesel fuel loops with grid-integrated solar arrays.",
      "Install coastal battery container boxes (BESS) to supply night load stability.",
      "Introduce small-scale solar desalination systems to tap high local water demands."
    ]
  },
  "Andaman and Nicobar": {
    title: "Tidal Hybrid Power & Island Solar Grids",
    potential: "Pristine island ecologies & high marine tidal potentials",
    iconType: "wind",
    strategies: [
      "Integrate local solar arrays with offshore tidal generators to steady island power grids.",
      "Establish micro hydro generation stations in hilly forest streams of Great Nicobar.",
      "Transition marine tourist yachts and boats to electric motors powered by onshore solar."
    ]
  },
  "Dadra and Nagar Haveli": {
    title: "Industrial Cluster PV & Smart Loop Controls",
    potential: "Dense industrial manufacturing zones & high power load",
    iconType: "industrial",
    strategies: [
      "Mandate solar rooftop panels for all small-and-medium metal and polymer molding plants.",
      "Implement premium industrial waste heat boilers to generate high-efficiency clean steam.",
      "Establish premium power-factor controllers to save high-capacity line usage."
    ]
  },
  "Daman and Diu": {
    title: "Industrial Solar Upgrades & Coastal Wind Turbines",
    potential: "Beach tourist strip & manufacturing districts",
    iconType: "sun",
    strategies: [
      "Introduce 100% solar tax incentives for manufacturing facilities.",
      "Install shore-based wind turbines to capture strong morning wind gusts.",
      "Enforce grid automation to sync tourist zone peaks with industrial backup battery grids."
    ]
  }
};
