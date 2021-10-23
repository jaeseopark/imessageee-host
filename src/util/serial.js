export const isValidJson = (s) => {
    try {
        JSON.parse(s);
    } catch (e) {
        return false;
    }
    return true;
};
