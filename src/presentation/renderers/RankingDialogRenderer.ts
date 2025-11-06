import { RankingEntry } from '@domain/repositories/RankingRepository';

/**
 * RankingDialogRenderer
 *
 * ランキングダイアログの表示を担当するクラス
 */
export class RankingDialogRenderer {
  private dialogElement: HTMLElement;
  private closeButtonHandler?: () => void;

  constructor() {
    const dialogElement = document.getElementById('ranking-dialog');

    if (!dialogElement) {
      throw new Error('Ranking dialog element not found');
    }

    this.dialogElement = dialogElement;
  }

  /**
   * ランキングダイアログを表示
   *
   * @param entries - 表示するランキングエントリー
   */
  show(entries: RankingEntry[]): void {
    this.render(entries);
    this.dialogElement.classList.remove('hidden');
    this.setupEventListeners();
  }

  /**
   * ランキングダイアログを非表示
   */
  hide(): void {
    this.dialogElement.classList.add('hidden');
    this.removeEventListeners();
  }

  /**
   * ランキングを描画
   *
   * @param entries - 表示するランキングエントリー
   */
  private render(entries: RankingEntry[]): void {
    const listElement = document.getElementById('ranking-list');

    if (!listElement) {
      throw new Error('Ranking list element not found');
    }

    // リストをクリア
    listElement.innerHTML = '';

    if (entries.length === 0) {
      // ランキングが空の場合
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'ranking-empty';
      emptyMessage.textContent = 'まだランキングがありません';
      listElement.appendChild(emptyMessage);
      return;
    }

    // ランキングを表示
    entries.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'ranking-item';

      const rank = document.createElement('span');
      rank.className = 'ranking-rank';
      rank.textContent = `${index + 1}位`;

      const score = document.createElement('span');
      score.className = 'ranking-score';
      score.textContent = entry.score.toString();

      const date = document.createElement('span');
      date.className = 'ranking-date';
      date.textContent = this.formatDate(entry.timestamp);

      item.appendChild(rank);
      item.appendChild(score);
      item.appendChild(date);

      listElement.appendChild(item);
    });
  }

  /**
   * タイムスタンプを日付文字列にフォーマット
   *
   * @param timestamp - Unix timestamp
   * @returns フォーマットされた日付文字列
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    this.removeEventListeners();

    this.closeButtonHandler = () => {
      this.hide();
    };

    const closeButton = document.getElementById('ranking-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', this.closeButtonHandler);
    }

    // ダイアログの外側をクリックしたら閉じる
    this.dialogElement.addEventListener('click', (event) => {
      if (event.target === this.dialogElement) {
        this.hide();
      }
    });
  }

  /**
   * イベントリスナーを削除
   */
  private removeEventListeners(): void {
    const closeButton = document.getElementById('ranking-close-btn');
    if (closeButton && this.closeButtonHandler) {
      closeButton.removeEventListener('click', this.closeButtonHandler);
      this.closeButtonHandler = undefined;
    }
  }
}
