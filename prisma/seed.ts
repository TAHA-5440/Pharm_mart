import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HERO = "/images/hero.jpg";
const TANK = "/images/tanks.jpg";
const LINE = "/images/line.jpg";
const LAB = "/images/lab.jpg";
const HVAC = "/images/hvac.jpg";
const WORK = "/images/workshop.jpg";

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rfqMatch.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.favouriteListing.deleteMany();
  await prisma.savedSupplier.deleteMany();
  await prisma.productListing.deleteMany();
  await prisma.usedMachineListing.deleteMany();
  await prisma.supplierCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.buyerOrganisation.deleteMany();
  await prisma.supplierOrganisation.deleteMany();
  await prisma.category.deleteMany();

  const pharma = await prisma.category.create({
    data: { name: "Pharmaceutical", slug: "pharmaceutical", kind: "industry" },
  });
  const machinery = await prisma.category.create({
    data: {
      name: "Machinery",
      slug: "pharmaceutical-machinery",
      kind: "family",
      parentId: pharma.id,
    },
  });
  const leaves = [
    ["Tablet compression machines", "tablet-compression-machines"],
    ["Mixing and blending", "mixing-and-blending"],
    ["Blister packing machines", "blister-packing-machines"],
    ["Capsule filling", "capsule-filling"],
    ["Liquid oral manufacturing", "liquid-oral-manufacturing"],
    ["Laboratory equipment", "laboratory-equipment"],
    ["HVAC", "hvac"],
    ["Water systems", "water-systems"],
    ["SS fabrication", "ss-fabrication"],
    ["Spare parts", "spare-parts"],
    ["Validation and calibration", "validation-calibration"],
    ["Used machinery", "used-machinery"],
  ];
  const createdLeaves = [];
  for (const [name, slug] of leaves) {
    createdLeaves.push(
      await prisma.category.create({
        data: { name, slug, kind: "type", parentId: machinery.id },
      }),
    );
  }
  const mix = createdLeaves.find((c) => c.slug === "mixing-and-blending")!;
  const lab = createdLeaves.find((c) => c.slug === "laboratory-equipment")!;
  const used = createdLeaves.find((c) => c.slug === "used-machinery")!;

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "sarah.b@example.net",
      passwordHash,
      name: "Ops Admin",
      role: "admin",
      phone: "+923001111111",
    },
  });

  const buyerOrg = await prisma.buyerOrganisation.create({
    data: {
      legalName: "Lahore Pharma Ltd",
      industry: "pharmaceutical",
      city: "Lahore",
      about: "Mid-size tablet and liquid oral plant.",
    },
  });
  await prisma.user.create({
    data: {
      email: "maria.s@example.com",
      passwordHash,
      name: "Ahmed Khan",
      jobTitle: "Purchase Manager",
      role: "buyer",
      phone: "+923004444444",
      buyerOrgId: buyerOrg.id,
    },
  });

  const abc = await prisma.supplierOrganisation.create({
    data: {
      legalName: "ABC Engineering",
      displayName: "ABC Engineering",
      slug: "abc-engineering",
      tagline: "SS316 process equipment for pharma and food",
      about:
        "Stainless fabrication and process equipment for pharmaceutical and food plants. Mixing vessels, tanks, and installation since 2008.",
      yearEstablished: 2008,
      city: "Lahore",
      citiesServed: "Lahore, Faisalabad, Gujranwala, Pakistan",
      address: "Plot 12, Sundar Industrial Estate, Lahore",
      phone: "+924211111111",
      whatsapp: "+923002222222",
      email: "laura.c@example.net",
      ntn: "1234567-8",
      cnic: "35202-1234567-1",
      businessProofUrl: WORK,
      logoUrl: TANK,
      industries: "pharmaceutical,food_beverage",
      servicesOffered: "Manufacturing, Installation, Maintenance",
      verification: "verified_supplier",
      publicStatus: "approved",
      coverUrl: TANK,
      catalogueUrl: "/demo/abc-engineering-catalogue.txt",
    },
  });
  await prisma.user.create({
    data: {
      email: "laura.c@example.net",
      passwordHash,
      name: "Sara Malik",
      role: "supplier",
      phone: "+923002222222",
      supplierOrgId: abc.id,
    },
  });

  const hussain = await prisma.supplierOrganisation.create({
    data: {
      legalName: "Hussain Fabricators",
      displayName: "Hussain Fabricators",
      slug: "hussain-fabricators",
      about:
        "Process tanks and mixers for food and pharma. Workshop in Gujranwala with installation crews nationwide.",
      yearEstablished: 1999,
      city: "Gujranwala",
      citiesServed: "Gujranwala, Lahore, Sialkot",
      phone: "+925511111111",
      email: "david.c@example.com",
      industries: "pharmaceutical,food_beverage",
      verification: "business_verified",
      publicStatus: "approved",
      coverUrl: LINE,
    },
  });
  await prisma.user.create({
    data: {
      email: "david.c@example.com",
      passwordHash,
      name: "Imran Hussain",
      role: "supplier",
      supplierOrgId: hussain.id,
    },
  });

  const pak = await prisma.supplierOrganisation.create({
    data: {
      legalName: "Pak Process Equip",
      displayName: "Pak Process Equip",
      slug: "pak-process-equip",
      about: "Imported and local process machinery for pharmaceutical plants.",
      yearEstablished: 2012,
      city: "Karachi",
      citiesServed: "Karachi, Hyderabad, Pakistan",
      phone: "+922111111111",
      email: "hannah.h@example.com",
      industries: "pharmaceutical",
      verification: "industry_verified",
      publicStatus: "approved",
      coverUrl: LINE,
    },
  });
  await prisma.user.create({
    data: {
      email: "hannah.h@example.com",
      passwordHash,
      name: "Nadia Sheikh",
      role: "supplier",
      supplierOrgId: pak.id,
    },
  });

  for (const supplier of [abc, hussain, pak]) {
    await prisma.supplierCategory.createMany({
      data: [
        { supplierId: supplier.id, categoryId: mix.id },
        { supplierId: supplier.id, categoryId: createdLeaves[0].id },
      ],
    });
  }

  await prisma.productListing.create({
    data: {
      supplierId: abc.id,
      categoryId: mix.id,
      name: "SS316 mixing vessels",
      slug: "ss316-mixing-vessels",
      shortDesc: "Jacketed mixing vessels 200–2000 L, cGMP finish.",
      longDesc:
        "Built for pharma and food plants. Jacketed, cGMP polish, documentation pack on request.",
      specs:
        "Material: SS316\nVolume range: 200–2000 L\nFinish: cGMP\nJacket: Yes\nUse: Pharma / food mixing",
      imageUrl: TANK,
      status: "live",
      priceOnRequest: true,
      leadDays: 45,
    },
  });

  await prisma.productListing.createMany({
    data: [
      {
        supplierId: abc.id,
        categoryId: createdLeaves[0].id,
        name: "Tablet compression machines",
        slug: "tablet-compression-machines",
        shortDesc: "Rotary tablet presses for GMP tablet halls.",
        longDesc: "Tooling, change parts, and installation available.",
        specs: "Type: Rotary press\nIndustry: Pharmaceutical\nInstallation: Available",
        imageUrl: LINE,
        status: "live",
        priceOnRequest: true,
        leadDays: 60,
        kind: "product",
      },
      {
        supplierId: pak.id,
        categoryId: lab.id,
        name: "Laboratory HPLC systems",
        slug: "laboratory-hplc-systems",
        shortDesc: "Analytical HPLC for QC labs — new and supported used.",
        specs: "Use: QC / R&D\nSupport: Installation and IQ/OQ support",
        imageUrl: LAB,
        status: "live",
        priceOnRequest: true,
        leadDays: 30,
        kind: "product",
      },
      {
        supplierId: hussain.id,
        categoryId: createdLeaves[6].id,
        name: "Clean-area HVAC packages",
        slug: "clean-area-hvac-packages",
        shortDesc: "AHU and ducting packages for classified areas.",
        specs: "Scope: AHU, filtration, ducting\nIndustry: Pharma / food",
        imageUrl: HVAC,
        status: "live",
        priceOnRequest: true,
        leadDays: 50,
        kind: "product",
      },
      {
        supplierId: hussain.id,
        categoryId: createdLeaves[2].id,
        name: "Blister packing lines",
        slug: "blister-packing-lines",
        shortDesc: "Primary packing lines for tablets and capsules.",
        specs: "Format: Blister\nChange parts: On request",
        imageUrl: LINE,
        status: "live",
        priceOnRequest: true,
        kind: "product",
      },
      {
        supplierId: abc.id,
        categoryId: createdLeaves[9].id,
        name: "SS spare parts and fittings",
        slug: "ss-spare-parts-fittings",
        shortDesc: "Valves, fittings, and spare parts for process lines.",
        specs: "Material: SS316 / SS304\nKind: Spare parts",
        imageUrl: WORK,
        status: "live",
        priceOnRequest: true,
        kind: "product",
      },
    ],
  });

  await prisma.usedMachineListing.create({
    data: {
      sellerId: pak.id,
      categoryId: lab.id,
      title: "HPLC System — Waters Alliance e2695",
      slug: "hplc-waters-alliance-e2695-lahore",
      manufacturer: "Waters",
      model: "Alliance e2695",
      year: 2018,
      condition: "refurbished",
      city: "Lahore",
      description:
        "Refurbished Waters Alliance e2695 HPLC. Installation available. Inspection available in Lahore. Control panel and nameplate photographed.",
      photoUrls: [LAB, TANK, LINE, HERO, LAB].join(","),
      pricePkr: 4850000,
      warranty: "3 months",
      installation: true,
      inspection: true,
      status: "live",
    },
  });

  await prisma.usedMachineListing.create({
    data: {
      sellerId: abc.id,
      categoryId: used.id,
      title: "500 L SS316 mixing vessel",
      slug: "500l-ss316-vessel-faisalabad",
      manufacturer: "ABC Engineering",
      model: "MV-500",
      year: 2020,
      condition: "good",
      city: "Faisalabad",
      description: "Plant upgrade surplus. Jacketed, food/pharma finish.",
      photoUrls: TANK,
      requestPrice: true,
      installation: true,
      inspection: true,
      status: "live",
    },
  });

  console.log("Seeded. Demo logins (password: password123):");
  console.log("  admin    sarah.b@example.net");
  console.log("  buyer    maria.s@example.com");
  console.log("  supplier laura.c@example.net");
  void admin;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
