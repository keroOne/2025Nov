/**
 * Cookieの読み書きユーティリティ
 */
export class CookieUtil {
  /**
   * Cookieを取得
   */
  static get(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  }

  /**
   * Cookieを設定
   */
  static set(name: string, value: string, days: number = 365): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  }

  /**
   * Cookieを削除
   */
  static remove(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * 数値を取得
   */
  static getNumber(name: string, defaultValue: number): number {
    const value = this.get(name);
    if (value === null) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * 数値を設定
   */
  static setNumber(name: string, value: number, days: number = 365): void {
    this.set(name, value.toString(), days);
  }
}

