import SitePage, { siteMetadata } from "@/components/SitePage";

export const revalidate = 60;
export const generateMetadata = () => siteMetadata("es");

export default function Page() {
  return <SitePage locale="es" />;
}
