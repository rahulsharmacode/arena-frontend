function getUrlFileName(url: string) {
  const segments = url.split("/");
  return segments.pop();
}

function getTrim(text: string, length: number) {
  if (length > text.length) return text;
  text = text.trim().substring(0, length) + "...";
  return text;
}

const getExtension = (fileName: string) => {
  const parts = fileName?.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
};

const convetBase64Encoder = (data: string) => {
  let decodedStr = atob(data);
  let jsonData = JSON.parse(decodedStr || "");
  return jsonData;
};

const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

const useSlugs = (data = "") => {
  return data?.trim().toLowerCase().replace(/ /g, "-");
};

const useReverseSlug = (slug: any) => {
  return (
    slug &&
    slug
      ?.split("-")
      ?.map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export {
  convetBase64Encoder,
  getExtension,
  getTrim,
  getUrlFileName,
  handleKeyDown,
  useReverseSlug,
  useSlugs,
};
