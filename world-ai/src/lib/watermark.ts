export async function watermarkAndDownloadImage(
  imageUrl: string,
  logoUrl: string,
  filename: string,
  userType: string
) {
  if (userType !== "normal") {
    // Force download using fetch
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback to direct link
      window.open(imageUrl, "_blank");
    }
    return;
  }

  try {
    const [image, logo] = await Promise.all([
      loadImage(imageUrl),
      loadImage(logoUrl),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    // Watermark size: 15% of image width
    const logoWidth = image.width * 0.15;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      logo,
      image.width - logoWidth - 20,
      image.height - logoHeight - 20,
      logoWidth,
      logoHeight
    );
    ctx.globalAlpha = 1.0;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }
    }, "image/png");
  } catch (error) {
    console.error("Error processing image:", error);
    // Fallback to direct download if watermarking fails
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Final fallback to direct link
      window.open(imageUrl, "_blank");
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      // Try loading without crossOrigin if it fails
      const fallbackImg = new window.Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = reject;
      fallbackImg.src = src;
    };
    img.src = src;
  });
}
