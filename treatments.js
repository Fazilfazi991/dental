const dentivaTreatments = [
  {
    title: "Invisalign / Aligners",
    description: "Clear, comfortable aligners that gently straighten your teeth discreetly.",
    image: "assets/treatment-aligners.png",
  },
  {
    title: "Hawleys / Essix Retainers",
    description: "Custom-made retainers that keep your teeth in their new, perfect position.",
    image: "assets/dentiva-hero-patient-opt.jpg",
  },
  {
    title: "Teeth Whitening",
    description: "Safe and effective whitening for a visibly brighter, more confident smile.",
    image: "assets/treatment-whitening.png",
  },
  {
    title: "Veneers / Laminates",
    description: "Ultra-thin shells that improve the color, shape and overall appearance of teeth.",
    image: "assets/treatment-veneers.png",
  },
  {
    title: "Dentures",
    description: "High-quality removable dentures for natural function and confident smiles.",
    image: "assets/treatment-implants.png",
  },
  {
    title: "Cleaning & Polishing",
    description: "Professional cleaning to remove plaque, stains and keep your teeth healthy.",
    image: "assets/clinic-hero-opt.jpg",
  },
  {
    title: "Root Canal Treatment",
    description: "Relieve pain and save your natural tooth with advanced root canal care.",
    image: "assets/treatment-whitening.png",
  },
  {
    title: "Tooth Extraction",
    description: "Safe and gentle removal of damaged or problematic teeth.",
    image: "assets/dentiva-hero-patient-opt.jpg",
  },
  {
    title: "Tooth Filling / Restoration",
    description: "Restore decayed or damaged teeth with natural-looking, durable fillings.",
    image: "assets/treatment-veneers.png",
  },
];

const treatmentGrid = document.querySelector("#treatment-card-grid");

if (treatmentGrid) {
  treatmentGrid.innerHTML = dentivaTreatments
    .map(
      (treatment) => `
        <article class="treatment-modern-card reveal">
          <a class="treatment-card-media" href="contact.html#appointment" aria-label="Learn more about ${treatment.title}">
            <img src="${treatment.image}" alt="${treatment.title} at Dentiva Clinic" loading="lazy" />
          </a>
          <div class="treatment-card-copy">
            <h3>${treatment.title}</h3>
            <p>${treatment.description}</p>
            <a class="treatment-link" href="contact.html#appointment">Learn More <span aria-hidden="true">-&gt;</span></a>
          </div>
        </article>
      `
    )
    .join("");
}
