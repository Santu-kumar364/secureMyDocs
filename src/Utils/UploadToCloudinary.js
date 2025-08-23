const cloud_name = "dzxhzpc1h";
const upload_preset = "xzalCloud";

export const UploadToCloudinary = async (pics, fileType) => {
    if (!pics || !fileType) {
        console.error("Missing required parameters");
        throw new Error("Both file and fileType are required");
    }

    try {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", upload_preset);
        data.append("cloud_name", cloud_name);
        data.append("folder", fileType);

        // Determine the resource type based on fileType
        let resourceType = "auto"; // Use 'auto' to let Cloudinary detect the file type
        
        if (fileType === 'image') {
            resourceType = "image";
        } else if (fileType === 'video') {
            resourceType = "video";
        } else if (fileType === 'docs') {
            resourceType = "raw"; // Use 'raw' for documents to preserve original format
        }

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Upload failed");
        }

        const fileData = await res.json();
        console.log("Cloudinary response:", fileData);
        
        // For raw files, we need to use the secure_url directly
        return fileData.secure_url || fileData.url;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};