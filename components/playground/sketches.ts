export interface SketchDef {
  id: string
  title: string
  tech: string
  year: string
  image: string
  aspectRatio: '16:9' | '4:5' | '1:1' | '3:4' | '2:1'
  description: string
}

export const SKETCH_CATALOG: SketchDef[] = [
  {
    id: '01',
    title: 'CHROMATIC FLUID',
    tech: 'Procedural WebGL / GLSL',
    year: '2025',
    image: '/playground/sketch_01.jpg',
    aspectRatio: '4:5',
    description: 'Real-time Navier-Stokes fluid simulation rendered with custom iridescence shaders. Explores the tactile boundary between liquid dynamics and spectral light dispersion.'
  },
  {
    id: '02',
    title: 'NEON MONOLITH 01',
    tech: '3D Modeling / Blender / Cycles',
    year: '2025',
    image: '/playground/sketch_02.jpg',
    aspectRatio: '3:4',
    description: 'An imposing brutalist architectural structure illuminated by high-voltage neon conduits. A meditation on isolation and scale in post-human cyberpunk environments.'
  },
  {
    id: '03',
    title: 'CYBERNETIC CORE',
    tech: 'React Three Fiber / GLSL Shaders',
    year: '2024',
    image: '/playground/sketch_03.jpg',
    aspectRatio: '1:1',
    description: 'Interactive central processing unit with pulsating energy filaments and subsurface scattering glass layers. Designed as a real-time reactive visualizer for complex data streams.'
  },
  {
    id: '04',
    title: 'HYPERION GATE',
    tech: 'Abstract Rendering / Octane Render',
    year: '2025',
    image: '/playground/sketch_04.jpg',
    aspectRatio: '2:1',
    description: 'A colossal dimensional portal floating above an obsidian desert, bending gravitational light fields. Features procedural displacement terrain and volumetric atmospheric fog.'
  },
  {
    id: '05',
    title: 'PRISMATIC VOID',
    tech: 'Kinetic Sculpture / Houdini FX',
    year: '2024',
    image: '/playground/sketch_05.jpg',
    aspectRatio: '4:5',
    description: 'A floating kinetic glass sculpture that refracts environmental light into crisp geometric rainbows. Investigates perpetual motion and non-Euclidean geometry in zero gravity.'
  },
  {
    id: '06',
    title: 'HOLOGRAPHIC RELIC',
    tech: 'Generative AI / TouchDesigner',
    year: '2024',
    image: '/playground/sketch_06.jpg',
    aspectRatio: '16:9',
    description: 'An archaeological artifact from a speculative future, encased in a decaying photonic projection field. Created by merging latent diffusion models with real-time feedback loops.'
  },
  {
    id: '07',
    title: 'SOLAR PROMINENCE',
    tech: 'Procedural WebGL / Three.js',
    year: '2024',
    image: '/playground/sketch_07.jpg',
    aspectRatio: '3:4',
    description: 'Simulated plasma loops erupting from the surface of a miniature artificial sun. Features real-time bloom post-processing and dynamic volumetric radiation field noise.'
  },
  {
    id: '08',
    title: 'QUANTUM LATTICE',
    tech: 'React Three Fiber / R3F',
    year: '2025',
    image: '/playground/sketch_08.jpg',
    aspectRatio: '16:9',
    description: 'A multi-dimensional crystalline matrix shifting between solid, liquid, and energy states. Utilizes custom vertex shaders to simulate quantum entanglement visual effects.'
  },
  {
    id: '09',
    title: 'OBSIDIAN SPIRE',
    tech: '3D Modeling / Blender',
    year: '2025',
    image: '/playground/sketch_09.jpg',
    aspectRatio: '4:5',
    description: 'A towering obsidian structure carving through atmospheric haze in an alien landscape. Designed with procedural edge wear and dynamic reflections.'
  },
  {
    id: '10',
    title: 'NEBULA CASCADE',
    tech: 'Abstract Rendering / Cinema 4D',
    year: '2026',
    image: '/playground/sketch_10.jpg',
    aspectRatio: '3:4',
    description: 'Cascading streams of ionized cosmic dust swirling within a localized gravitational pocket. Rendered with multi-scattering volumetric cloud shaders.'
  },
  {
    id: '11',
    title: 'SYNAPSE MATRIX',
    tech: 'Procedural WebGL / GLSL',
    year: '2024',
    image: '/playground/sketch_11.jpg',
    aspectRatio: '1:1',
    description: 'An interconnected web of artificial neurons firing high-frequency data signals across a synthetic neural pathway. Explores emergent intelligence through visual complexity.'
  },
  {
    id: '12',
    title: 'VORTEX CHAMBER',
    tech: 'Houdini FX / Octane Render',
    year: '2025',
    image: '/playground/sketch_12.jpg',
    aspectRatio: '2:1',
    description: 'A cylindrical containment vessel channeling a hyper-dense aerodynamic vortex. Explores turbulent fluid dynamics trapped in perpetual rotational equilibrium.'
  },
  {
    id: '13',
    title: 'MIRAGE HORIZON',
    tech: 'Unreal Engine 5 / Lumen',
    year: '2026',
    image: '/playground/sketch_13.jpg',
    aspectRatio: '4:5',
    description: 'A shifting desert landscape where atmospheric refraction distorts distant monolithic landmarks. Real-time global illumination captures the blistering thermal gradient.'
  },
  {
    id: '14',
    title: 'ECLIPSE ENGINE',
    tech: 'Cinema 4D / Redshift',
    year: '2025',
    image: '/playground/sketch_14.jpg',
    aspectRatio: '16:9',
    description: 'An orbital mechanical apparatus designed to harvest energy from solar occultations. Features intricate gear assemblies and heat-radiating metallic fins.'
  },
  {
    id: '15',
    title: 'SOLARIS STATION',
    tech: '3D Modeling / Blender / Cycles',
    year: '2026',
    image: '/playground/sketch_15.jpg',
    aspectRatio: '3:4',
    description: 'A deep-space research outpost orbiting a pulsated binary star system. Designed with modular habitation rings and heavy radiation shielding.'
  },
  {
    id: '16',
    title: 'KINETIC WAVE',
    tech: 'Kinetic Sculpture / Houdini FX',
    year: '2024',
    image: '/playground/sketch_16.jpg',
    aspectRatio: '16:9',
    description: 'Thousands of synchronized brushed-aluminum rods undulating in harmonic sine waves. A physical embodiment of acoustic frequency propagation.'
  },
  {
    id: '17',
    title: 'LUMINA TOWER',
    tech: 'Octane Render / Cinema 4D',
    year: '2025',
    image: '/playground/sketch_17.jpg',
    aspectRatio: '4:5',
    description: 'A vertical beacon composed of stacked crystalline prisms emitting soft bioluminescent gradients. Designed to guide autonomous air traffic through dense cybernetic megacities.'
  },
  {
    id: '18',
    title: 'AURA FLUX',
    tech: 'TouchDesigner / GLSL Shaders',
    year: '2026',
    image: '/playground/sketch_18.jpg',
    aspectRatio: '3:4',
    description: 'Real-time electromagnetic field visualization mapped onto geometric toruses. Reacts dynamically to ambient radio frequencies and acoustic interference.'
  },
  {
    id: '19',
    title: 'SPECTRA DRIFT',
    tech: 'Procedural WebGL / Three.js',
    year: '2024',
    image: '/playground/sketch_19.jpg',
    aspectRatio: '1:1',
    description: 'A cloud of chromatic particles drifting through a simulated zero-gravity wind tunnel. Highlights advanced instancing techniques and custom compute shaders.'
  },
  {
    id: '20',
    title: 'ZENITH PEAK',
    tech: 'Unreal Engine 5 / Nanite',
    year: '2025',
    image: '/playground/sketch_20.jpg',
    aspectRatio: '2:1',
    description: 'The highest summit of a synthetic mountain range, crowned by an orbital communications array. Leverages virtualized geometry for unprecedented geological detail.'
  },
  {
    id: '21',
    title: 'ASTRONOMY GRID',
    tech: 'Raymarching SDF',
    year: '2025',
    image: '/playground/sketch_21.jpg',
    aspectRatio: '4:5',
    description: 'A celestial cartography grid mapping stellar coordinates in deep space. Utilizes signed distance fields to render infinite astronomical lattices with precision luminosity.'
  },
  {
    id: '22',
    title: 'CYBERPUNK ALLEY',
    tech: 'Unreal Engine 5',
    year: '2026',
    image: '/playground/sketch_22.jpg',
    aspectRatio: '16:9',
    description: 'A rain-slicked dystopian corridor bathed in holographic advertisements and neon reflections. Features real-time raytraced reflections and volumetric steam shaders.'
  },
  {
    id: '23',
    title: 'MONOLITH 02',
    tech: '3D Modeling / Blender',
    year: '2025',
    image: '/playground/sketch_23.jpg',
    aspectRatio: '3:4',
    description: 'A monumental carbon-fiber slab hovering silently above a turbulent ocean. Investigates minimalist geometry contrasted against chaotic organic fluid simulations.'
  },
  {
    id: '24',
    title: 'HYPERDRIVE COIL',
    tech: 'Houdini FX',
    year: '2024',
    image: '/playground/sketch_24.jpg',
    aspectRatio: '16:9',
    description: 'Superconducting magnetic coils generating a warp field for faster-than-light interstellar travel. Rendered with complex particle trajectories and chromatic distortion.'
  },
  {
    id: '25',
    title: 'QUANTUM FOAM',
    tech: 'Procedural WebGL / GLSL',
    year: '2026',
    image: '/playground/sketch_25.jpg',
    aspectRatio: '4:5',
    description: 'Sub-atomic spacetime fluctuations rendered at Planck scale with dynamic procedural noise. Captures the ephemeral boiling of virtual particles in a vacuum.'
  },
  {
    id: '26',
    title: 'IONIC THRUSTER',
    tech: 'Cinema 4D / Redshift',
    year: '2025',
    image: '/playground/sketch_26.jpg',
    aspectRatio: '3:4',
    description: 'An advanced propulsion engine emitting a focused stream of xenon plasma ions. Features intense glow gradients and detailed mechanical exhaust manifolds.'
  },
  {
    id: '27',
    title: 'CHROMA BEAM',
    tech: 'Octane Render',
    year: '2024',
    image: '/playground/sketch_27.jpg',
    aspectRatio: '1:1',
    description: 'Concentrated photonic laser beams refracting through floating optical glass elements. Demonstrates spectral dispersion and caustic light patterns in an atmospheric void.'
  },
  {
    id: '28',
    title: 'NEON PULSE',
    tech: 'TouchDesigner',
    year: '2026',
    image: '/playground/sketch_28.jpg',
    aspectRatio: '2:1',
    description: 'Rhythmic waveforms of high-voltage neon energy pulsing through an abstract cybernetic grid. Audio-reactive visualizer designed for immersive synthwave installations.'
  },
  {
    id: '29',
    title: 'VIRTUAL SANCTUM',
    tech: 'Unreal Engine 5',
    year: '2025',
    image: '/playground/sketch_29.jpg',
    aspectRatio: '4:5',
    description: 'An ethereal digital temple constructed from floating marble arches and golden light shafts. Explores sacred architectural geometry in a virtualized metaverse environment.'
  },
  {
    id: '30',
    title: 'OBSIDIAN MIRROR',
    tech: '3D Modeling / Blender',
    year: '2026',
    image: '/playground/sketch_30.jpg',
    aspectRatio: '16:9',
    description: 'A perfectly polished volcanic glass reflector distorting the surrounding sci-fi metropolis. Showcases complex dielectric shader properties and Fresnel reflectivity.'
  },
  {
    id: '31',
    title: 'PLASMA ARCH',
    tech: 'Houdini FX',
    year: '2024',
    image: '/playground/sketch_31.jpg',
    aspectRatio: '3:4',
    description: 'An architectural gateway bridged by superheated magnetically confined plasma arcs. Combines rigid metallic structures with turbulent fluid fire simulations.'
  },
  {
    id: '32',
    title: 'TESSERACT FOLD',
    tech: 'Procedural WebGL / GLSL',
    year: '2025',
    image: '/playground/sketch_32.jpg',
    aspectRatio: '16:9',
    description: 'A four-dimensional hypercube continuously folding and unfolding through 3D space. Utilizes custom matrix transformations to visualize non-Euclidean geometry.'
  },
  {
    id: '33',
    title: 'SONIC RESONANCE',
    tech: 'Kinetic Sculpture',
    year: '2026',
    image: '/playground/sketch_33.jpg',
    aspectRatio: '4:5',
    description: 'A mechanical array of vibrating copper strings creating standing acoustic wave patterns. Explores the physical manifestation of harmonic sound frequencies in motion.'
  },
  {
    id: '34',
    title: 'FRACTAL GARDEN',
    tech: 'Raymarching SDF',
    year: '2024',
    image: '/playground/sketch_34.jpg',
    aspectRatio: '3:4',
    description: 'A botanical ecosystem formed from recursive 3D Mandelbulb fractals and crystalline growth. Investigates mathematical self-similarity as a basis for artificial life.'
  },
  {
    id: '35',
    title: 'GRAVITY WELL',
    tech: 'Cinema 4D / Redshift',
    year: '2025',
    image: '/playground/sketch_35.jpg',
    aspectRatio: '1:1',
    description: 'A localized gravitational depression pulling asteroid debris into a central singularity. Rendered with motion-blurred debris fields and volumetric space dust.'
  },
  {
    id: '36',
    title: 'SOLAR FLARE',
    tech: 'Procedural WebGL / Three.js',
    year: '2026',
    image: '/playground/sketch_36.jpg',
    aspectRatio: '2:1',
    description: 'Massive magnetic plasma eruptions bursting from the photosphere of an active star. Features real-time procedural noise and bloom intensity modulation.'
  },
  {
    id: '37',
    title: 'ORBITAL RING',
    tech: '3D Modeling / Blender',
    year: '2025',
    image: '/playground/sketch_37.jpg',
    aspectRatio: '4:5',
    description: 'A megastructure encircling a gas giant planet, glittering with millions of habitat windows. Demonstrates immense scale and planetary orbital mechanics.'
  },
  {
    id: '38',
    title: 'TITANIUM MATRIX',
    tech: 'Substance Designer',
    year: '2024',
    image: '/playground/sketch_38.jpg',
    aspectRatio: '16:9',
    description: 'An ultra-durable aerospace alloy lattice engineered for maximum tensile strength. Highlights procedural surface texturing, micro-scratches, and metallic luster.'
  },
  {
    id: '39',
    title: 'LUMINANCE CORE',
    tech: 'React Three Fiber / GLSL',
    year: '2026',
    image: '/playground/sketch_39.jpg',
    aspectRatio: '3:4',
    description: 'A radiant energy reactor housing a self-sustaining sphere of pure white light. Employs subsurface scattering and volumetric glow shaders for intense luminosity.'
  },
  {
    id: '40',
    title: 'NEON CANYON',
    tech: 'Unreal Engine 5',
    year: '2025',
    image: '/playground/sketch_40.jpg',
    aspectRatio: '16:9',
    description: 'A deep urban gorge walled by towering skyscrapers and illuminated by vibrant cybernetic signage. Captures the verticality and atmosphere of future megacities.'
  },
  {
    id: '41',
    title: 'VOXEL SCULPTURE',
    tech: 'ZBrush Sculpting',
    year: '2024',
    image: '/playground/sketch_41.jpg',
    aspectRatio: '4:5',
    description: 'A digital sculpture bridging organic anatomy with rigid volumetric pixel blocks. Explores the intersection of traditional sculpting and digital quantization.'
  },
  {
    id: '42',
    title: 'PRISMATIC BEAM',
    tech: 'Octane Render',
    year: '2026',
    image: '/playground/sketch_42.jpg',
    aspectRatio: '3:4',
    description: 'A concentrated beam of white light splitting into a vibrant spectrum across geometric baffles. A study in optical physics and photorealistic glass refraction.'
  },
  {
    id: '43',
    title: 'AETHER REALM',
    tech: 'Generative AI / TouchDesigner',
    year: '2025',
    image: '/playground/sketch_43.jpg',
    aspectRatio: '1:1',
    description: 'A dreamlike dimension of floating islands and shimmering auroral curtains. Synthesized through neural network diffusion models trained on atmospheric phenomena.'
  },
  {
    id: '44',
    title: 'QUANTUM REEF',
    tech: 'Houdini FX',
    year: '2024',
    image: '/playground/sketch_44.jpg',
    aspectRatio: '2:1',
    description: 'A synthetic underwater ecosystem where bioluminescent quantum organisms thrive in crystalline structures. Combines organic growth algorithms with fluid dynamics.'
  },
  {
    id: '45',
    title: 'CYBER SHIELD',
    tech: 'Procedural WebGL / GLSL',
    year: '2026',
    image: '/playground/sketch_45.jpg',
    aspectRatio: '4:5',
    description: 'A hexagonal energy barrier deflecting incoming particle projectiles with localized ripple effects. Features real-time impact shader reactivity and force field luminescence.'
  },
  {
    id: '46',
    title: 'MONOLITH 03',
    tech: '3D Modeling / Blender / Cycles',
    year: '2025',
    image: '/playground/sketch_46.jpg',
    aspectRatio: '16:9',
    description: 'A solitary golden structure standing Sentinel in an icy glacial wasteland. Contrasts pristine geometric perfection against rugged eroded natural terrain.'
  },
  {
    id: '47',
    title: 'HYPERION FLUX',
    tech: 'Cinema 4D / Octane',
    year: '2026',
    image: '/playground/sketch_47.jpg',
    aspectRatio: '3:4',
    description: 'High-energy relativistic streams of matter accelerating through a magnetic containment ring. Rendered with motion blur and chromatic emission gradients.'
  },
  {
    id: '48',
    title: 'STELLAR NURSERY',
    tech: 'Procedural WebGL / Three.js',
    year: '2025',
    image: '/playground/sketch_48.jpg',
    aspectRatio: '16:9',
    description: 'A vast cosmic cloud of gas and dust birthing new infant stars amidst glowing nebulae. Utilizes volumetric raymarching and particle systems to simulate stellar evolution.'
  }
]
