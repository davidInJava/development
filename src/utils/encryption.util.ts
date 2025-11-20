export class PSNGenerator {
  static generate(dateOfBirth: Date, gender: 'MALE' | 'FEMALE', serialNumber: number): string {
    const day = dateOfBirth.getDate();
    const month = dateOfBirth.getMonth() + 1;
    const year = dateOfBirth.getFullYear();

    let firstTwo: number;
    if (gender === 'MALE') {
      firstTwo = 10 + day; // 11-41
    } else {
      firstTwo = 50 + day; // 51-81
    }

    // 3-4 цифры: месяц + век
    const century = year >= 2000 ? 20 : 0;
    const monthCentury = century + month;

    // 5-6 цифры: год
    const yearTwoDigits = year % 100;

    // 7-9 цифры: серийный номер
    const serial = String(serialNumber).padStart(3, '0');

    // Собираем первые 9 цифр
    const firstNine =
      `${String(firstTwo).padStart(2, '0')}` +
      `${String(monthCentury).padStart(2, '0')}` +
      `${String(yearTwoDigits).padStart(2, '0')}` +
      `${serial}`;

    // 10 цифра: контрольная
    const checkDigit = this.calculateCheckDigit(firstNine);

    return firstNine + checkDigit;
  }

  private static calculateCheckDigit(nineDigits: string): string {
    let sum = 0;
    for (let i = 0; i < nineDigits.length; i++) {
      sum += parseInt(nineDigits[i]) * (i + 1);
    }
    return String(sum % 10);
  }

  static validate(psn: string): boolean {
    if (psn.length !== 10 || !/^\d{10}$/.test(psn)) {
      return false;
    }

    const nineDigits = psn.substring(0, 9);
    const providedCheckDigit = psn[9];
    const calculatedCheckDigit = this.calculateCheckDigit(nineDigits);

    return providedCheckDigit === calculatedCheckDigit;
  }

  static extractInfo(psn: string): {
    day: number;
    month: number;
    year: number;
    gender: 'MALE' | 'FEMALE';
  } | null {
    if (!this.validate(psn)) {
      return null;
    }

    const firstTwo = parseInt(psn.substring(0, 2));
    const monthCentury = parseInt(psn.substring(2, 4));
    const yearTwoDigits = parseInt(psn.substring(4, 6));

    // Гендер и день
    let gender: 'MALE' | 'FEMALE';
    let day: number;

    if (firstTwo >= 11 && firstTwo <= 41) {
      gender = 'MALE';
      day = firstTwo - 10;
    } else if (firstTwo >= 51 && firstTwo <= 81) {
      gender = 'FEMALE';
      day = firstTwo - 50;
    } else {
      return null;
    }

    // Месяц и век
    let month: number;
    let century: number;

    if (monthCentury >= 1 && monthCentury <= 12) {
      month = monthCentury;
      century = 1900;
    } else if (monthCentury >= 21 && monthCentury <= 32) {
      month = monthCentury - 20;
      century = 2000;
    } else {
      return null;
    }

    const year = century + yearTwoDigits;

    return { day, month, year, gender };
  }
}
