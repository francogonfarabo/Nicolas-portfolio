/**
 * Local fallback for profile + work history, and the source for `npm run seed`.
 * Once Sanity has content, edit in the Studio (/studio) instead. This file is only used if Sanity is unreachable.
 *
 * Source of truth: "CV Nicolas English.pdf". Only obvious spacing/spelling typos were fixed.
 */
import type { StaticImageData } from "next/image";
import type { Img, Profile, Work } from "./types";
import portrait from "./images/portrait.jpg";
import littleNico from "./images/little-nico.jpg";

export const fromStatic = (img: StaticImageData, alt: string, focus?: Img["focus"]): Img => ({
  src: img.src,
  width: img.width,
  height: img.height,
  blurDataURL: img.blurDataURL,
  alt,
  focus,
});

export const profile: Profile = {
  name: "Nicolás González Farabollini",
  shortName: "Nico",
  role: "Cloud & DevOps Engineer",
  since: "2019",
  intro: "Keeps clouds tidy, pipelines green, and dev and ops talking to each other.",
  portrait: fromStatic(
    portrait,
    "Portrait of Nico: dark curly hair, short beard, white shirt, smiling softly at the camera.",
    { x: 0.5, y: 0.32 },
  ),
  childhood: fromStatic(
    littleNico,
    "Childhood photo of Nico at a wooden kitchen table in a fluffy blue sweater, holding a screwdriver over a toy he is taking apart.",
    { x: 0.57, y: 0.43 },
  ),
  childhoodQuote:
    "From a very young age, I was deeply fascinated by solving problems and possessed a natural curiosity about how things worked and functioned in the world around me. This early interest sparked a lifelong passion for understanding complex systems and finding creative solutions.",
  email: "NicolasGF@outlook.com.ar",
  linkedin: "https://www.linkedin.com/in/nicolas-gonzalez-farabollini/",
  cvUrl: "/Nicolas-Gonzalez-Farabollini-CV.pdf",
  contactTitle: "Got a system that needs untangling?",
  contactBody: "Pipelines, clouds, even a live broadcast studio. Nico would love to take a look.",
};

export const work: Work = {
  roles: [
    {
      title: "DevOps Engineer",
      org: "Cognativ Inc.",
      orgUrl: "https://www.linkedin.com/company/cognativ/",
      start: "Oct 2023",
      current: true,
      paragraphs: [
        "Experience implementing CI/CD tools, accelerating development, testing, and deployment across various projects, using diverse platforms and technologies.",
        "Constantly collaborating to drive a shift towards a DevOps culture, building bridges between development and operations teams, tackling the challenge of fostering a more collaborative, communicative, and automated work environment.",
        "I have worked with clients in the EdTech, finance, and streaming services industries, collaborating with professionals from the United States, Serbia, Spain, Argentina, and India.",
        "Also the in-house administrator of Microsoft 365, Zoho, AWS, Slack, Azure, and Bitdefender.",
      ],
    },
    {
      title: "IT Infrastructure Consultant",
      org: "Freelancer",
      start: "2019",
      end: "2023",
      current: false,
      paragraphs: ["Server administration, networking, and maintenance for institutional and corporate clients."],
      clients: ["National University of Villa María", "MG Cleaning Company", "Tecnoteca Villa María", "Corpus Médical"],
    },
  ],
  projects: [
    {
      name: "Equal Edge",
      url: "https://www.equaledgeu.com/",
      start: "Nov 2024",
      current: true,
      intro: "Full infrastructure as code for AWS with Terraform.",
      bullets: [
        "Creation of full infrastructure as code for AWS using Terraform, including RDS PostgreSQL, S3, AppRunner, API Gateway, and Cognito.",
      ],
      skills: ["aws", "terraform"],
    },
    {
      name: "The Inception Company",
      start: "Aug 2024",
      current: true,
      intro: "Hybrid on-prem + AWS infrastructure behind a live broadcast studio.",
      bullets: [
        "Documentation, maintenance, and support of a pre-existing hybrid infrastructure (on-premises and AWS) connected via AWS Direct Connect, including a TV-style studio with live broadcast equipment based on NDI and servers running proprietary applications.",
        "AWS EC2 VMs hosting Node.js applications, FFmpeg, CUDA, and proprietary software in C.",
        "Migrated infrastructure from EC2-based machines to Elastic Beanstalk and S3 + CloudFront.",
        "Implementation of CI/CD with GitHub Actions.",
        "Live event support: debugging and studio equipment operations (NDI, on-premises Windows Server).",
      ],
      skills: ["aws", "github-actions", "troubleshooting"],
    },
    {
      name: "Honest Game",
      start: "Apr 2024",
      current: true,
      intro: "Terraform on AWS, CI/CD, a three-engine database migration, Laravel on Kubernetes.",
      bullets: [
        "Implementation of CI/CD with GitHub Actions.",
        "Infrastructure as code creation for AWS using Terraform, including Amplify, Lightsail, RDS PostgreSQL, Lambda functions, SQS, EC2, S3, OpenVPN, and Elastic Container Registry.",
        "Conversion and migration of a production MariaDB database to MySQL via SQL dump, followed by migration to PostgreSQL using PGLoader.",
        "Debugging and maintenance of a production PHP Laravel application running on a Kubernetes cluster.",
      ],
      skills: ["github-actions", "aws", "terraform", "amplify", "registries", "kubernetes"],
    },
    {
      name: "Paradigm Cyber, Extempore, Screen360 & Tactive",
      start: "Oct 2023",
      current: true,
      intro: "Ongoing support.",
      bullets: ["Support."],
      skills: ["client-management"],
    },
    {
      name: "Vector Media",
      start: "Dec 2024",
      end: "Feb 2026",
      current: false,
      intro: "CI/CD, Terraform + Ansible on DigitalOcean, three dockerized payment APIs.",
      bullets: [
        "Implementation of CI/CD pipelines using GitHub Actions.",
        "Infrastructure as code creation for DigitalOcean using Terraform and Ansible, including droplets, managed databases, networking, and managed Redis.",
        "Dockerization of 3 payment APIs and a frontend application.",
      ],
      skills: ["github-actions", "digitalocean", "terraform", "ansible", "docker"],
    },
    {
      name: "CloudIX",
      start: "Dec 2024",
      end: "Feb 2026",
      current: false,
      intro: "Terraform on Google Cloud, CI/CD, self-hosted SonarQube for SAST.",
      bullets: [
        "Implementation of CI/CD with GitHub Actions.",
        "Infrastructure as code creation for GCP using Terraform, including Cloud Run, VM, Key Management, Secret Manager, Cloud SQL for Postgres, and Cloud Storage.",
        "Self-hosted SonarQube instance for SAST quality checks.",
      ],
      skills: ["github-actions", "gcp", "terraform", "sonarqube"],
    },
    {
      name: "Billd",
      start: "Jun 2024",
      end: "Aug 2024",
      current: false,
      intro: "Existing infra moved to Terraform; .NET apps moved to App Runner at lower cost.",
      bullets: [
        "Maintenance, support, and documentation of pre-existing infrastructure, migrated to Terraform.",
        "Containerization of .NET applications and migration from Elastic Beanstalk to App Runner, achieving cost reduction.",
        "CI/CD implementation using Bitbucket Pipelines.",
        "Infrastructure included a .NET backend on Windows IIS, Angular frontend, Elastic Beanstalk, EC2, S3, Amplify, RDS Microsoft MySQL, API Gateway, Cognito, ECR, and OpenVPN.",
      ],
      skills: ["aws", "terraform", "docker", "bitbucket", "amplify", "registries"],
    },
    {
      name: "eClose",
      start: "Feb 2024",
      end: "Aug 2024",
      current: false,
      intro: "AWS infrastructure from API Gateway to Snowflake.",
      bullets: ["Infrastructure creation in AWS using API Gateway, EC2 ETL, OpenVPN, Snowflake, Lambda, S3, and Amplify."],
      skills: ["aws", "amplify"],
    },
    {
      name: "Metamorphix",
      start: "Oct 2023",
      end: "Jul 2024",
      current: false,
      intro: "Azure end to end: Bitbucket CI/CD, containers, Web Apps, Grafana metrics.",
      bullets: [
        "Implementation of CI/CD with Bitbucket Pipelines using a runner on Azure VM.",
        "Containerization and optimization of artifacts for a NestJS backend and NextJS frontend. CI/CD for a custom Keycloak template.",
        "Infrastructure setup based on Azure Web App Service with continuous deployment via Docker tags, Azure Container Registry, OpenVPN, ETL VM, PostgreSQL Flexible, Azure Storage, and Azure Containers.",
        "Metrics integration in Grafana, configured with role-based access through Azure Web App Service.",
      ],
      skills: ["azure", "bitbucket", "docker", "registries", "grafana"],
    },
    {
      name: "LLFounds",
      start: "Oct 2023",
      end: "Apr 2024",
      current: false,
      intro: "Maintenance and security hardening of an existing AWS setup.",
      bullets: [
        "Maintenance, support, and documentation of existing AWS infrastructure.",
        "Security enhancements in VPC, security groups, subnets, and roles.",
        "Infrastructure included an Angular frontend and a Node.js backend.",
      ],
      skills: ["aws"],
    },
  ],
  certificates: [
    {
      name: "AWS Certified Solutions Architect – Associate",
      date: "Dec 2025",
      url: "https://www.credly.com/badges/012f6ad8-8b19-4bac-bc46-48b76aa0f1df/linked_in?t=t73whj",
    },
    {
      name: "Azure Administrator Associate (AZ-104)",
      date: "Sep 2025",
      url: "https://learn.microsoft.com/en-us/users/nicolasgonzalezfarabollini-7918/credentials/c67d8eec0aff70f5",
    },
    {
      name: "Azure Fundamentals (AZ-900)",
      date: "Jun 2024",
      url: "https://learn.microsoft.com/en-us/users/nicolasgonzalezfarabollini-7918/credentials/2d6704480b250797",
    },
    {
      name: "AWS Certified Cloud Practitioner",
      date: "Dec 2023",
      url: "https://www.credly.com/badges/c88e0e77-4700-4fdc-b9c9-2ca52f9a5785/linked_in_profile",
    },
    { name: "Cambridge C1 Advanced", date: "Jun 2023", note: "C2274250" },
    {
      name: "EducaciónIT – Azure Fundamentals",
      date: "Sep 2022",
      url: "https://api.educacionit.com/pdf/certificados/nicolas-gonzalez-farabollini-663714/60601",
    },
  ],
  education: {
    degree: "Bachelor in Audiovisual Design and Production",
    school: "National University of Villa María",
    start: "2012",
    end: "2019",
    place: "Villa María, Argentina",
  },
  languages: [
    { name: "Spanish", level: "Native" },
    { name: "English", level: "C1 Advanced · Cambridge" },
  ],
};
