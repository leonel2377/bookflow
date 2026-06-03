/** Nettoie DATABASE_URL (guillemets / espaces ajoutés parfois dans hPanel). */
export function cleanDatabaseUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  return trimmed || undefined;
}

export function validateDatabaseUrlFormat(raw?: string): string | true {
  const url = cleanDatabaseUrl(raw);
  if (!url) return "DATABASE_URL manquant";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "DATABASE_URL invalide — format : mysql://USER:MDP@localhost:3306/NOM_BASE";
  }

  if (parsed.protocol !== "mysql:") {
    return "DATABASE_URL doit commencer par mysql://";
  }
  if (!parsed.hostname) {
    return "Hôte manquant — ajoutez @localhost:3306 après le mot de passe";
  }
  if (!parsed.pathname || parsed.pathname === "/") {
    return "Nom de base manquant — finissez par /u835607784_bookflow";
  }
  if (!parsed.port && parsed.hostname !== "localhost") {
    return "Port manquant — utilisez @localhost:3306";
  }

  return true;
}
