export function getUploadFileId (uploadSignedURL) {
    return uploadSignedURL.match(/(?:\.com\/)(.+)(?=\?)/)[1]
}