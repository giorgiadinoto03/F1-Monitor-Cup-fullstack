import React from "react";

const SideImage = ({ src, alt, position }) => {
    if (!src) {
        console.error("SideImage: 'src' non è stato fornito.");
        return null;
    }

    return (
        <div className={`side-image ${position}`}>
            <img src={src} alt={alt || "Immagine laterale"} />
        </div>
    );
};

export default SideImage;
