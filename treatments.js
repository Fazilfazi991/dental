const dentivaTreatments = [
  {
    category: "Aligners",
    title: "Invisalign / Aligners",
    description:
      "Invisalign is made of clear aligners instead of fixed brackets and wire braces. It provides an almost invisible orthodontic alternative to traditional metal appliances and helps gently move teeth into better alignment.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/01-invisalign-aligners.png",
  },
  {
    category: "Retainers",
    title: "Hawleys / Essix Retainers",
    description:
      "A teeth retainer is a custom-made device worn over the teeth. It helps keep the teeth in their new and correct position after braces or aligner treatment.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/02-hawleys-essix-retainers.png",
  },
  {
    category: "Everbrite",
    title: "Teeth Whitening",
    description:
      "Teeth whitening, also called teeth bleaching, is a simple and safe process that uses bleaching agents such as hydrogen peroxide or carbamide peroxide to lighten tooth color and improve smile brightness.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/03-teeth-whitening-everbrite.png",
  },
  {
    category: "Veneers",
    title: "Veneers / Laminates",
    description:
      "Dental veneers are wafer-thin, custom-made shells of tooth-colored material designed to cover the front surface of teeth. They help improve the appearance of teeth by changing their color, shape, size, or length.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/04-veneers-laminates.png",
  },
  {
    category: "Removable Appliance / Prosthesis",
    title: "Dentures",
    description:
      "Dentures are artificial replacements for one or several teeth, or all teeth. They can be partial dentures or full dentures and are used to restore chewing function, appearance, and confidence.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/05-dentures-removable-appliance.png",
  },
  {
    category: "Oral Prophylaxis",
    title: "Cleaning & Polishing",
    description:
      "Cleaning and polishing is a procedure done to remove plaque, stains, and build-up from the surfaces of teeth, including hidden areas between teeth and under the gums. It helps maintain oral hygiene and keeps teeth healthier.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/06-cleaning-and-polishing.png",
  },
  {
    category: "RCT",
    title: "Root Canal Treatment",
    description:
      "Root canal treatment is a dental procedure used to treat infection at the centre of a tooth. It is not usually painful and can help save a tooth that might otherwise have to be completely removed.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/07-root-canal-treatment-rct.png",
  },
  {
    category: "Extraction",
    title: "Tooth Extraction",
    description:
      "Tooth extraction is a dental procedure where a tooth is completely removed from its socket. It may be needed when a tooth is badly damaged, infected, loose, or cannot be saved by other treatments.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/08-tooth-extraction.png",
  },
  {
    category: "Tooth Restoration",
    title: "Tooth Filling / Restoration",
    description:
      "A dental filling is a procedure used to fill a hole or cavity in a tooth. You may need a filling if tooth structure is lost due to decay, trauma, or wear. It helps restore the tooth's shape, strength, and function.",
    image: "assets/dentiva-treatment-images/dentiva_treatment_images/09-tooth-filling-restoration.png",
  },
];

const treatmentGrid = document.querySelector("#treatment-card-grid");

if (treatmentGrid) {
  treatmentGrid.innerHTML = dentivaTreatments
    .map(
      (treatment) => `
        <article class="treatment-modern-card reveal">
          <div class="treatment-card-media">
            <img src="${treatment.image}" alt="${treatment.title} at Dentiva Clinic" loading="lazy" />
          </div>
          <div class="treatment-card-copy">
            <span class="treatment-category">${treatment.category}</span>
            <h3>${treatment.title}</h3>
            <p>${treatment.description}</p>
          </div>
        </article>
      `
    )
    .join("");
}
