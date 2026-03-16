declare module "youtube-transcript/dist/youtube-transcript.esm.js" {
  export class YoutubeTranscript {
    static fetchTranscript(
      videoId: string,
      config?: { lang?: string }
    ): Promise<Array<{ text: string; duration: number; offset: number; lang: string }>>;
  }
  export function fetchTranscript(
    videoId: string,
    config?: { lang?: string }
  ): Promise<Array<{ text: string; duration: number; offset: number; lang: string }>>;
}
