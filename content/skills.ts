/**
 * Local fallback for the skills chart, and the source for `npm run seed`.
 * Edit in the Studio (/studio → Skills chart) once Sanity has content.
 *
 * The CV doesn't state proficiency levels, so EVERY value is an estimate (see `basis`).
 * Colours were checked for colour-blind separation and 3:1 contrast on white; keep the order.
 */
import type { Skills } from "./types";

export const skills: Skills = {
  rings: [
    { value: 25, label: "exploring" },
    { value: 50, label: "working" },
    { value: 75, label: "proficient" },
    { value: 100, label: "expert" },
  ],
  categories: [
    {
      id: "cloud",
      label: "Cloud",
      color: "#2563EB",
      skills: [
        { key: "aws", label: "AWS", value: 90, basis: "Solutions Architect + Cloud Practitioner certs; 7 projects" },
        { key: "azure", label: "Azure", value: 75, basis: "AZ-104 + AZ-900; Metamorphix; in-house admin" },
        { key: "gcp", label: "Google Cloud", value: 55, basis: "Listed platform; CloudIX" },
        { key: "digitalocean", label: "DigitalOcean", value: 50, basis: "Vector Media" },
      ],
    },
    {
      id: "iac",
      label: "Infra as Code",
      color: "#EA580C",
      skills: [
        { key: "terraform", label: "Terraform", value: 88, basis: "5 projects across AWS, GCP and DigitalOcean" },
        { key: "ansible", label: "Ansible", value: 45, basis: "Vector Media" },
        { key: "cloudformation", label: "CloudFormation", value: 40, basis: "Listed in tools only" },
        { key: "arm", label: "ARM templates", value: 40, basis: "Listed in tools only" },
      ],
    },
    {
      id: "containers",
      label: "Containers",
      color: "#0D9488",
      skills: [
        { key: "docker", label: "Docker", value: 85, basis: "Vector Media, Metamorphix, Billd" },
        { key: "compose", label: "Docker Compose", value: 65, basis: "Listed in tools" },
        { key: "registries", label: "Registries", value: 65, basis: "Docker registry, ECR, Azure Container Registry" },
        { key: "kubernetes", label: "Kubernetes", value: 45, basis: "Honest Game (debugging & maintenance)" },
      ],
    },
    {
      id: "cicd",
      label: "CI/CD",
      color: "#B45309",
      skills: [
        { key: "github-actions", label: "GitHub Actions", value: 88, basis: "4 projects" },
        { key: "bitbucket", label: "Bitbucket Pipelines", value: 72, basis: "Metamorphix, Billd" },
        { key: "amplify", label: "Amplify", value: 60, basis: "Honest Game, eClose, Billd" },
        { key: "codedeploy", label: "CodeDeploy", value: 40, basis: "Listed in tools only" },
        { key: "jenkins", label: "Jenkins", value: 35, basis: "Listed in tools only" },
      ],
    },
    {
      id: "observability",
      label: "Quality",
      color: "#9333EA",
      skills: [
        { key: "grafana", label: "Grafana", value: 55, basis: "Metamorphix" },
        { key: "sonarqube", label: "SonarQube", value: 55, basis: "CloudIX (self-hosted)" },
      ],
    },
    {
      id: "scripting",
      label: "Scripting",
      color: "#4D7C0F",
      skills: [
        { key: "git", label: "Git", value: 80, basis: "Underpins every CI/CD project" },
        { key: "bash", label: "Bash", value: 75, basis: "Listed first in tools" },
        { key: "python", label: "Python", value: 55, basis: "Listed in tools" },
      ],
    },
    {
      id: "human",
      label: "Soft skills",
      color: "#DB2777",
      skills: [
        { key: "troubleshooting", label: "Deductive troubleshooting", value: 85, basis: "Soft skill; live event debugging" },
        { key: "client-management", label: "Client management", value: 80, basis: "Soft skill; many concurrent clients" },
        { key: "creativity", label: "Creativity", value: 85, basis: "Soft skill; audiovisual design degree" },
      ],
    },
  ],
};
