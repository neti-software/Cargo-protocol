export default abstract class StringService {

    public static isNullOrWhitespace(value: string): boolean {
        return !value || !value.length || !StringService.checkWhitespaces(value);
    }

    private static checkWhitespaces(value: string): boolean {
        return /\S/.test(value)
    }
}
