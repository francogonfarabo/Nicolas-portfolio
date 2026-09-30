/**
 * Local fallback for the skills chart, and the source for `npm run seed`.
 * Edit in the Studio (/studio → Skills chart) once Sanity has content.
 *
 * The CV doesn't state proficiency levels, so EVERY value is an estimate (see `basis`).
 * Colours were checked for colour-blind separation and 3:1 contrast on white; keep the colour order.
 * Family and skill order sets the angle: short labels at the two ends, long ones on the diagonals,
 * so the fan spans the whole half-circle and the chart stays large.
 */
import type { RawSkills } from "./types";

export const skills: RawSkills = {
  rings: [
    { value: 25, label: { en: "exploring", es: "inicial" } },
    { value: 50, label: { en: "working", es: "intermedio" } },
    { value: 75, label: { en: "proficient", es: "avanzado" } },
    { value: 100, label: { en: "expert", es: "experto" } },
  ],
  categories: [
    {
      id: "cloud",
      label: { en: "Cloud", es: "Nube" },
      color: "#2563EB",
      skills: [
        { key: "aws", label: { en: "AWS" }, value: 90, basis: "Solutions Architect + Cloud Practitioner certs; 7 projects" },
        { key: "azure", label: { en: "Azure" }, value: 75, basis: "AZ-104 + AZ-900; Metamorphix; in-house admin" },
        { key: "gcp", label: { en: "Google Cloud" }, value: 55, basis: "Listed platform; CloudIX" },
        { key: "digitalocean", label: { en: "DigitalOcean" }, value: 50, basis: "Vector Media" },
      ],
    },
    {
      id: "iac",
      label: { en: "Infra as Code", es: "Infra como código" },
      color: "#EA580C",
      skills: [
        { key: "terraform", label: { en: "Terraform" }, value: 88, basis: "5 projects across AWS, GCP and DigitalOcean" },
        { key: "ansible", label: { en: "Ansible" }, value: 45, basis: "Vector Media" },
        { key: "cloudformation", label: { en: "CloudFormation" }, value: 40, basis: "Listed in tools only" },
        { key: "arm", label: { en: "ARM templates", es: "Plantillas ARM" }, value: 40, basis: "Listed in tools only" },
      ],
    },
    {
      id: "containers",
      label: { en: "Containers", es: "Contenedores" },
      color: "#0D9488",
      skills: [
        { key: "docker", label: { en: "Docker" }, value: 85, basis: "Vector Media, Metamorphix, Billd" },
        { key: "compose", label: { en: "Docker Compose" }, value: 65, basis: "Listed in tools" },
        { key: "registries", label: { en: "Registries", es: "Registros" }, value: 65, basis: "Docker registry, ECR, Azure Container Registry" },
        { key: "kubernetes", label: { en: "Kubernetes" }, value: 45, basis: "Honest Game (debugging & maintenance)" },
      ],
    },
    {
      id: "observability",
      label: { en: "Quality", es: "Calidad" },
      color: "#B45309",
      skills: [
        { key: "grafana", label: { en: "Grafana" }, value: 55, basis: "Metamorphix" },
        { key: "sonarqube", label: { en: "SonarQube" }, value: 55, basis: "CloudIX (self-hosted)" },
      ],
    },
    {
      id: "cicd",
      label: { en: "CI/CD" },
      color: "#9333EA",
      skills: [
        { key: "jenkins", label: { en: "Jenkins" }, value: 35, basis: "Listed in tools only" },
        { key: "codedeploy", label: { en: "CodeDeploy" }, value: 40, basis: "Listed in tools only" },
        { key: "amplify", label: { en: "Amplify" }, value: 60, basis: "Honest Game, eClose, Billd" },
        { key: "bitbucket", label: { en: "Bitbucket Pipelines" }, value: 72, basis: "Metamorphix, Billd" },
        { key: "github-actions", label: { en: "GitHub Actions" }, value: 88, basis: "4 projects" },
      ],
    },
    {
      id: "human",
      label: { en: "Soft skills", es: "Habilidades blandas" },
      color: "#4D7C0F",
      skills: [
        {
          key: "troubleshooting",
          label: { en: "Deductive troubleshooting", es: "Resolución deductiva de problemas" },
          value: 85,
          basis: "Soft skill; live event debugging",
        },
        {
          key: "client-management",
          label: { en: "Client management", es: "Gestión de clientes" },
          value: 80,
          basis: "Soft skill; many concurrent clients",
        },
        { key: "creativity", label: { en: "Creativity", es: "Creatividad" }, value: 85, basis: "Soft skill; audiovisual design degree" },
      ],
    },
    {
      id: "scripting",
      label: { en: "Scripting" },
      color: "#DB2777",
      skills: [
        { key: "python", label: { en: "Python" }, value: 55, basis: "Listed in tools" },
        { key: "bash", label: { en: "Bash" }, value: 75, basis: "Listed first in tools" },
        { key: "git", label: { en: "Git" }, value: 80, basis: "Underpins every CI/CD project" },
      ],
    },
  ],
};
