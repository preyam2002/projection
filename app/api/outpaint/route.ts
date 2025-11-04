import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { image, cropData } = await request.json();

    if (!image || !cropData) {
      return NextResponse.json(
        { error: "Missing image or crop data" },
        { status: 400 }
      );
    }

    if (!process.env.EDENAI_API_KEY) {
      return NextResponse.json(
        { error: "Eden AI API key not configured" },
        { status: 500 }
      );
    }

    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Twitter header dimensions: 1500x500
    const targetWidth = 1500;
    const targetHeight = 500;

    // Create a prompt for image generation/outpainting
    // We'll use the original image as context in the prompt
    const prompt = `Create a seamless Twitter header background image (1500x500 pixels, landscape orientation). The image should have a natural, cohesive aesthetic that would work well as a social media header. Extend the visual style and atmosphere to fill the entire header space with beautiful, harmonious composition.`;

    // Use Eden AI image generation API with JSON format
    // Try multiple providers for better reliability
    const providers = ["openai", "stabilityai"]; // You can add more providers

    let imageUrl: string | null = null;
    let lastError: Error | null = null;

    // Try each provider until one succeeds
    for (const provider of providers) {
      try {
        const response = await fetch(
          "https://api.edenai.run/v2/image/generation",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.EDENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              providers: provider,
              text: prompt,
              resolution: `${targetWidth}x${targetHeight}`,
              num_images: 1,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Eden AI ${provider} error:`, errorText);
          continue;
        }

        const data = await response.json();

        // Handle different response structures from different providers
        let result = data[provider];
        if (!result && Object.keys(data).length > 0) {
          result = data[Object.keys(data)[0]];
        }

        imageUrl =
          result?.items?.[0]?.image_resource_url ||
          result?.image_resource_url ||
          result?.image_url ||
          result?.url;

        if (imageUrl) {
          break; // Success, exit the loop
        }
      } catch (error) {
        console.error(`Error with ${provider}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (!imageUrl) {
      throw (
        lastError || new Error("Failed to generate image with all providers")
      );
    }

    // Fetch the generated image
    const imageResponse = await fetch(imageUrl);
    const generatedImageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Resize to exact Twitter dimensions using Sharp
    const resizedBuffer = await sharp(generatedImageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "center",
      })
      .png()
      .toBuffer();

    // Convert to base64 data URL
    const base64Result = resizedBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Result}`;

    return NextResponse.json({
      headerUrl: dataUrl,
    });
  } catch (error) {
    console.error("Error generating header:", error);
    return NextResponse.json(
      {
        error: "Failed to generate header",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
