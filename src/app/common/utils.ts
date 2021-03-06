export class Utils  {

    public static getFormattedDate(dateString: string, dateValidationPattern: string, separator= "-", suffix = "T00:00:00.000Z"): string {
        let dateRegex: RegExp = new RegExp(dateValidationPattern);
        let formattedDate: string = '';
        let dateRegexMatches: RegExpExecArray = dateRegex.exec(dateString);
        if (dateRegexMatches != null && dateRegexMatches.length == 4) {
          if (dateRegexMatches[1].length == 1) {
            dateRegexMatches[1] = '0' + dateRegexMatches[1];
          }
          if (dateRegexMatches[2].length == 1) {
            dateRegexMatches[2] = '0' + dateRegexMatches[2];
          }
          if (dateRegexMatches[3].length == 2) {
            dateRegexMatches[3] = '20' + dateRegexMatches[3];
          }
          return dateRegexMatches[3] + separator
            + dateRegexMatches[2] + separator
            + dateRegexMatches[1] + suffix;
        }
    
        return null;
      }
}