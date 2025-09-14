import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private auth = inject(AuthService);

  stream(message: string, opts?: { prompt?: string }): Observable<string> {
    return new Observable<string>((observer) => {
      const at = this.auth.getAccessToken();
      const controller = new AbortController();

      (async () => {
        try {
          const body: any = { message };
          if (opts?.prompt) body.prompt = opts.prompt;

          const res = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(at ? { Authorization: `Bearer ${at}` } : {})
            },
            body: JSON.stringify(body),
            signal: controller.signal
          });

          if (!res.ok || !res.body) {
            const errMsg = (await res.json().catch(() => null))?.error || "Chat request failed";
            throw new Error(errMsg);
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split(/\r?\n/);

            for (const line of lines) {
              if (!line || !line.startsWith("data:")) continue;
              observer.next(line.replace(/^data:\s?/, ""));
            }
          }

          observer.complete();
        } catch (e: any) {
          if (!controller.signal.aborted) observer.error(e);
        }
      })();

      return () => controller.abort();
    });
  }
}