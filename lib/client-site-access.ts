export function canOpenClientSite(input: {
  projectStatus?: string | null;
  siteStatus?: string | null;
  productionUrl?: string | null;
}) {
  return Boolean(input.productionUrl?.trim() && (input.projectStatus === "live" || input.siteStatus === "actif"));
}
