export const ensureHttpProtocol = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};

export const formatDateForInput = (dateString) => {
        // Return empty string if no date provided
        if (!dateString) return ""

        try {
            // Create Date object from ISO string
            const date = new Date(dateString)

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn("Invalid date format:", dateString)
                return ""
            }

            // Get year (4 digits)
            const year = date.getFullYear()

            // Get month (1-12) and pad with zero if needed (01-12)
            const month = String(date.getMonth() + 1).padStart(2, "0")

            // Return in yyyy-MM format
            return `${year}-${month}`
        } catch (error) {
            console.warn("Error formatting date:", dateString, error)
            return ""
        }
    }