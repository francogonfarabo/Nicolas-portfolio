/**
 * Local fallback for profile + work history, and the source for `npm run seed`.
 * Once Sanity has content, edit in the Studio (/studio) instead. This file is only used if Sanity is unreachable.
 *
 * English is from "CV Nicolas English.pdf" (only obvious typos fixed). Spanish is a drafted
 * translation for Nico to review. Dates are "YYYY" or "YYYY-MM"; the site formats them per language.
 */
import type { StaticImageData } from "next/image";
import type { L, RawImg, RawProfile, RawWork } from "./types";
import portrait from "./images/portrait.jpg";
import littleNico from "./images/little-nico.jpg";

export const fromStatic = (img: StaticImageData, alt: L, focus?: RawImg["focus"]): RawImg => ({
  src: img.src,
  width: img.width,
  height: img.height,
  blurDataURL: img.blurDataURL,
  alt,
  focus,
});

export const profile: RawProfile = {
  name: "Nicolás González Farabollini",
  shortName: "Nico",
  role: { en: "Cloud & DevOps Engineer", es: "Ingeniero Cloud & DevOps" },
  since: "2019",
  intro: {
    en: "Keeps clouds tidy, pipelines green, and dev and ops talking to each other.",
    es: "Mantiene las nubes ordenadas, los pipelines en verde y a desarrollo y operaciones hablando entre sí.",
  },
  portrait: fromStatic(
    portrait,
    {
      en: "Portrait of Nico: dark curly hair, short beard, white shirt, smiling softly at the camera.",
      es: "Retrato de Nico: pelo oscuro y rizado, barba corta, camisa blanca, sonriendo suavemente a cámara.",
    },
    { x: 0.5, y: 0.32 },
  ),
  childhood: fromStatic(
    littleNico,
    {
      en: "Childhood photo of Nico at a wooden kitchen table in a fluffy blue sweater, holding a screwdriver over a toy he is taking apart.",
      es: "Foto de Nico de chico en la mesa de madera de la cocina, con un suéter azul abrigado, sosteniendo un destornillador sobre un juguete que está desarmando.",
    },
    { x: 0.57, y: 0.43 },
  ),
  childhoodQuote: {
    en: "From a very young age, I was deeply fascinated by solving problems and possessed a natural curiosity about how things worked and functioned in the world around me. This early interest sparked a lifelong passion for understanding complex systems and finding creative solutions.",
    es: "Desde muy chico me fascinó resolver problemas y tuve una curiosidad natural por entender cómo funcionaban las cosas en el mundo que me rodeaba. Ese interés temprano despertó una pasión de toda la vida por comprender sistemas complejos y encontrar soluciones creativas.",
  },
  email: "NicolasGF@outlook.com.ar",
  linkedin: "https://www.linkedin.com/in/nicolas-gonzalez-farabollini/",
  instagram: "https://www.instagram.com/gonzalezfarabollini/",
  cvUrl: "/Nicolas-Gonzalez-Farabollini-CV.pdf",
  contactTitle: { en: "Got a system that needs untangling?", es: "¿Hay un sistema que necesite desenredarse?" },
  contactBody: {
    en: "Pipelines, clouds, even a live broadcast studio. Nico would love to take a look.",
    es: "Pipelines, nubes, incluso un estudio de transmisión en vivo. A Nico le encantaría darle una mirada.",
  },
};

export const work: RawWork = {
  roles: [
    {
      title: { en: "DevOps Engineer", es: "Ingeniero DevOps" },
      org: { en: "Cognativ Inc." },
      orgUrl: "https://www.linkedin.com/company/cognativ/",
      start: "2023-10",
      current: true,
      paragraphs: [
        {
          en: "Experience implementing CI/CD tools, accelerating development, testing, and deployment across various projects, using diverse platforms and technologies.",
          es: "Experiencia implementando herramientas de CI/CD que aceleran el desarrollo, las pruebas y los despliegues en distintos proyectos, con diversas plataformas y tecnologías.",
        },
        {
          en: "Constantly collaborating to drive a shift towards a DevOps culture, building bridges between development and operations teams, tackling the challenge of fostering a more collaborative, communicative, and automated work environment.",
          es: "Colaboro constantemente para impulsar el cambio hacia una cultura DevOps, tendiendo puentes entre los equipos de desarrollo y operaciones y afrontando el desafío de fomentar un entorno de trabajo más colaborativo, comunicativo y automatizado.",
        },
        {
          en: "I have worked with clients in the EdTech, finance, and streaming services industries, collaborating with professionals from the United States, Serbia, Spain, Argentina, and India.",
          es: "Trabajé con clientes de las industrias EdTech, finanzas y servicios de streaming, colaborando con profesionales de Estados Unidos, Serbia, España, Argentina e India.",
        },
        {
          en: "Also the in-house administrator of Microsoft 365, Zoho, AWS, Slack, Azure, and Bitdefender.",
          es: "Además, administrador interno de Microsoft 365, Zoho, AWS, Slack, Azure y Bitdefender.",
        },
      ],
    },
    {
      title: { en: "IT Infrastructure Consultant", es: "Consultor de infraestructura IT" },
      org: { en: "Freelancer", es: "Independiente" },
      start: "2019",
      end: "2023",
      current: false,
      paragraphs: [
        {
          en: "Server administration, networking, and maintenance for institutional and corporate clients.",
          es: "Administración de servidores, redes y mantenimiento para clientes institucionales y corporativos.",
        },
      ],
      clients: [
        { en: "National University of Villa María", es: "Universidad Nacional de Villa María" },
        { en: "MG Cleaning Company" },
        { en: "Tecnoteca Villa María" },
        { en: "Corpus Médical" },
      ],
    },
  ],
  projects: [
    {
      name: "Equal Edge",
      url: "https://www.equaledgeu.com/",
      start: "2024-11",
      current: true,
      intro: {
        en: "Full infrastructure as code for AWS with Terraform.",
        es: "Infraestructura como código completa para AWS con Terraform.",
      },
      bullets: [
        {
          en: "Creation of full infrastructure as code for AWS using Terraform, including RDS PostgreSQL, S3, AppRunner, API Gateway, and Cognito.",
          es: "Creación de infraestructura como código completa para AWS con Terraform, incluyendo RDS PostgreSQL, S3, AppRunner, API Gateway y Cognito.",
        },
      ],
      skills: ["aws", "terraform"],
    },
    {
      name: "The Inception Company",
      start: "2024-08",
      current: true,
      intro: {
        en: "Hybrid on-prem + AWS infrastructure behind a live broadcast studio.",
        es: "Infraestructura híbrida on-premise + AWS detrás de un estudio de transmisión en vivo.",
      },
      bullets: [
        {
          en: "Documentation, maintenance, and support of a pre-existing hybrid infrastructure (on-premises and AWS) connected via AWS Direct Connect, including a TV-style studio with live broadcast equipment based on NDI and servers running proprietary applications.",
          es: "Documentación, mantenimiento y soporte de una infraestructura híbrida existente (on-premise y AWS) conectada mediante AWS Direct Connect, que incluye un estudio estilo TV con equipamiento de transmisión en vivo basado en NDI y servidores con aplicaciones propietarias.",
        },
        {
          en: "AWS EC2 VMs hosting Node.js applications, FFmpeg, CUDA, and proprietary software in C.",
          es: "VMs de AWS EC2 que alojan aplicaciones Node.js, FFmpeg, CUDA y software propietario en C.",
        },
        {
          en: "Migrated infrastructure from EC2-based machines to Elastic Beanstalk and S3 + CloudFront.",
          es: "Migración de la infraestructura desde máquinas basadas en EC2 a Elastic Beanstalk y S3 + CloudFront.",
        },
        { en: "Implementation of CI/CD with GitHub Actions.", es: "Implementación de CI/CD con GitHub Actions." },
        {
          en: "Live event support: debugging and studio equipment operations (NDI, on-premises Windows Server).",
          es: "Soporte en eventos en vivo: depuración y operación del equipamiento de estudio (NDI, Windows Server on-premise).",
        },
      ],
      skills: ["aws", "github-actions", "troubleshooting"],
    },
    {
      name: "Honest Game",
      start: "2024-04",
      current: true,
      intro: {
        en: "Terraform on AWS, CI/CD, a three-engine database migration, Laravel on Kubernetes.",
        es: "Terraform en AWS, CI/CD, una migración de base de datos entre tres motores y Laravel sobre Kubernetes.",
      },
      bullets: [
        { en: "Implementation of CI/CD with GitHub Actions.", es: "Implementación de CI/CD con GitHub Actions." },
        {
          en: "Infrastructure as code creation for AWS using Terraform, including Amplify, Lightsail, RDS PostgreSQL, Lambda functions, SQS, EC2, S3, OpenVPN, and Elastic Container Registry.",
          es: "Creación de infraestructura como código para AWS con Terraform, incluyendo Amplify, Lightsail, RDS PostgreSQL, funciones Lambda, SQS, EC2, S3, OpenVPN y Elastic Container Registry.",
        },
        {
          en: "Conversion and migration of a production MariaDB database to MySQL via SQL dump, followed by migration to PostgreSQL using PGLoader.",
          es: "Conversión y migración de una base de datos MariaDB en producción a MySQL mediante un dump SQL, y luego a PostgreSQL con PGLoader.",
        },
        {
          en: "Debugging and maintenance of a production PHP Laravel application running on a Kubernetes cluster.",
          es: "Depuración y mantenimiento de una aplicación PHP Laravel en producción que corre en un clúster de Kubernetes.",
        },
      ],
      skills: ["github-actions", "aws", "terraform", "amplify", "registries", "kubernetes"],
    },
    {
      name: "Paradigm Cyber, Extempore, Screen360 & Tactive",
      start: "2023-10",
      current: true,
      intro: { en: "Ongoing support.", es: "Soporte continuo." },
      bullets: [{ en: "Support.", es: "Soporte." }],
      skills: ["client-management"],
    },
    {
      name: "Vector Media",
      start: "2024-12",
      end: "2026-02",
      current: false,
      intro: {
        en: "CI/CD, Terraform + Ansible on DigitalOcean, three dockerized payment APIs.",
        es: "CI/CD, Terraform + Ansible en DigitalOcean y tres APIs de pago dockerizadas.",
      },
      bullets: [
        {
          en: "Implementation of CI/CD pipelines using GitHub Actions.",
          es: "Implementación de pipelines de CI/CD con GitHub Actions.",
        },
        {
          en: "Infrastructure as code creation for DigitalOcean using Terraform and Ansible, including droplets, managed databases, networking, and managed Redis.",
          es: "Creación de infraestructura como código para DigitalOcean con Terraform y Ansible, incluyendo droplets, bases de datos administradas, redes y Redis administrado.",
        },
        {
          en: "Dockerization of 3 payment APIs and a frontend application.",
          es: "Dockerización de 3 APIs de pago y una aplicación frontend.",
        },
      ],
      skills: ["github-actions", "digitalocean", "terraform", "ansible", "docker"],
    },
    {
      name: "CloudIX",
      start: "2024-12",
      end: "2026-02",
      current: false,
      intro: {
        en: "Terraform on Google Cloud, CI/CD, self-hosted SonarQube for SAST.",
        es: "Terraform en Google Cloud, CI/CD y un SonarQube autohospedado para SAST.",
      },
      bullets: [
        { en: "Implementation of CI/CD with GitHub Actions.", es: "Implementación de CI/CD con GitHub Actions." },
        {
          en: "Infrastructure as code creation for GCP using Terraform, including Cloud Run, VM, Key Management, Secret Manager, Cloud SQL for Postgres, and Cloud Storage.",
          es: "Creación de infraestructura como código para GCP con Terraform, incluyendo Cloud Run, VM, Key Management, Secret Manager, Cloud SQL para Postgres y Cloud Storage.",
        },
        {
          en: "Self-hosted SonarQube instance for SAST quality checks.",
          es: "Instancia autohospedada de SonarQube para controles de calidad SAST.",
        },
      ],
      skills: ["github-actions", "gcp", "terraform", "sonarqube"],
    },
    {
      name: "Billd",
      start: "2024-06",
      end: "2024-08",
      current: false,
      intro: {
        en: "Existing infra moved to Terraform; .NET apps moved to App Runner at lower cost.",
        es: "Infraestructura existente llevada a Terraform; apps .NET migradas a App Runner con menor costo.",
      },
      bullets: [
        {
          en: "Maintenance, support, and documentation of pre-existing infrastructure, migrated to Terraform.",
          es: "Mantenimiento, soporte y documentación de la infraestructura existente, migrada a Terraform.",
        },
        {
          en: "Containerization of .NET applications and migration from Elastic Beanstalk to App Runner, achieving cost reduction.",
          es: "Contenerización de aplicaciones .NET y migración de Elastic Beanstalk a App Runner, logrando una reducción de costos.",
        },
        { en: "CI/CD implementation using Bitbucket Pipelines.", es: "Implementación de CI/CD con Bitbucket Pipelines." },
        {
          en: "Infrastructure included a .NET backend on Windows IIS, Angular frontend, Elastic Beanstalk, EC2, S3, Amplify, RDS Microsoft MySQL, API Gateway, Cognito, ECR, and OpenVPN.",
          es: "La infraestructura incluía un backend .NET sobre Windows IIS, frontend en Angular, Elastic Beanstalk, EC2, S3, Amplify, RDS Microsoft MySQL, API Gateway, Cognito, ECR y OpenVPN.",
        },
      ],
      skills: ["aws", "terraform", "docker", "bitbucket", "amplify", "registries"],
    },
    {
      name: "eClose",
      start: "2024-02",
      end: "2024-08",
      current: false,
      intro: {
        en: "AWS infrastructure from API Gateway to Snowflake.",
        es: "Infraestructura en AWS, de API Gateway a Snowflake.",
      },
      bullets: [
        {
          en: "Infrastructure creation in AWS using API Gateway, EC2 ETL, OpenVPN, Snowflake, Lambda, S3, and Amplify.",
          es: "Creación de infraestructura en AWS con API Gateway, ETL en EC2, OpenVPN, Snowflake, Lambda, S3 y Amplify.",
        },
      ],
      skills: ["aws", "amplify"],
    },
    {
      name: "Metamorphix",
      start: "2023-10",
      end: "2024-07",
      current: false,
      intro: {
        en: "Azure end to end: Bitbucket CI/CD, containers, Web Apps, Grafana metrics.",
        es: "Azure de punta a punta: CI/CD con Bitbucket, contenedores, Web Apps y métricas en Grafana.",
      },
      bullets: [
        {
          en: "Implementation of CI/CD with Bitbucket Pipelines using a runner on Azure VM.",
          es: "Implementación de CI/CD con Bitbucket Pipelines usando un runner en una VM de Azure.",
        },
        {
          en: "Containerization and optimization of artifacts for a NestJS backend and NextJS frontend. CI/CD for a custom Keycloak template.",
          es: "Contenerización y optimización de artefactos para un backend NestJS y un frontend NextJS. CI/CD para una plantilla personalizada de Keycloak.",
        },
        {
          en: "Infrastructure setup based on Azure Web App Service with continuous deployment via Docker tags, Azure Container Registry, OpenVPN, ETL VM, PostgreSQL Flexible, Azure Storage, and Azure Containers.",
          es: "Infraestructura basada en Azure Web App Service con despliegue continuo mediante tags de Docker, Azure Container Registry, OpenVPN, VM de ETL, PostgreSQL Flexible, Azure Storage y Azure Containers.",
        },
        {
          en: "Metrics integration in Grafana, configured with role-based access through Azure Web App Service.",
          es: "Integración de métricas en Grafana, configurada con acceso basado en roles a través de Azure Web App Service.",
        },
      ],
      skills: ["azure", "bitbucket", "docker", "registries", "grafana"],
    },
    {
      name: "LLFounds",
      start: "2023-10",
      end: "2024-04",
      current: false,
      intro: {
        en: "Maintenance and security hardening of an existing AWS setup.",
        es: "Mantenimiento y refuerzo de seguridad de una infraestructura AWS existente.",
      },
      bullets: [
        {
          en: "Maintenance, support, and documentation of existing AWS infrastructure.",
          es: "Mantenimiento, soporte y documentación de la infraestructura AWS existente.",
        },
        {
          en: "Security enhancements in VPC, security groups, subnets, and roles.",
          es: "Mejoras de seguridad en VPC, grupos de seguridad, subredes y roles.",
        },
        {
          en: "Infrastructure included an Angular frontend and a Node.js backend.",
          es: "La infraestructura incluía un frontend en Angular y un backend en Node.js.",
        },
      ],
      skills: ["aws"],
    },
  ],
  certificates: [
    {
      name: { en: "AWS Certified Solutions Architect – Associate" },
      date: "2025-12",
      url: "https://www.credly.com/badges/012f6ad8-8b19-4bac-bc46-48b76aa0f1df/linked_in?t=t73whj",
    },
    {
      name: { en: "Azure Administrator Associate (AZ-104)" },
      date: "2025-09",
      url: "https://learn.microsoft.com/en-us/users/nicolasgonzalezfarabollini-7918/credentials/c67d8eec0aff70f5",
    },
    {
      name: { en: "Azure Fundamentals (AZ-900)" },
      date: "2024-06",
      url: "https://learn.microsoft.com/en-us/users/nicolasgonzalezfarabollini-7918/credentials/2d6704480b250797",
    },
    {
      name: { en: "AWS Certified Cloud Practitioner" },
      date: "2023-12",
      url: "https://www.credly.com/badges/c88e0e77-4700-4fdc-b9c9-2ca52f9a5785/linked_in_profile",
    },
    { name: { en: "Cambridge C1 Advanced" }, date: "2023-06", note: "C2274250" },
    {
      name: { en: "EducaciónIT – Azure Fundamentals" },
      date: "2022-09",
      url: "https://api.educacionit.com/pdf/certificados/nicolas-gonzalez-farabollini-663714/60601",
    },
  ],
  education: {
    degree: { en: "Bachelor in Audiovisual Design and Production", es: "Licenciatura en Diseño y Producción Audiovisual" },
    school: { en: "National University of Villa María", es: "Universidad Nacional de Villa María" },
    start: "2012",
    end: "2019",
    place: "Villa María, Argentina",
  },
  languages: [
    { name: { en: "Spanish", es: "Español" }, level: { en: "Native", es: "Nativo" } },
    { name: { en: "English", es: "Inglés" }, level: { en: "C1 Advanced · Cambridge" } },
  ],
};
