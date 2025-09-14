import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ChatService } from '../../core/services/chat.service';
import { CustomerService } from '../../core/services/customer.service';
import { ChatMessage } from '../../core/models/chat.model';

@Component({
  standalone: true,
  selector: 'app-chatbot',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss']
})
export class Chatbot implements AfterViewInit, OnInit {
  private chat = inject(ChatService);
  private customers = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLTextAreaElement>;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  streaming = signal(false);
  customerPrompt = signal<string | undefined>(undefined);
  customerName = signal<string | undefined>(undefined);
  private streamSub?: Subscription;

  chatForm: FormGroup = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) this.loadCustomerPrompt(slug);
    this.isOpen.set(true);
  }

  ngAfterViewInit() {
    setTimeout(() => this.autoResize());
  }

  private loadCustomerPrompt(slug: string) {
    this.customers.getBySlug(slug).subscribe({
      next: res => {
        if (res.data.prompt) {
          this.customerPrompt.set(res.data.prompt);
        }
        this.customerName.set(res.data.name || undefined);
      },
      error: () => {
      }
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => this.messageInput?.nativeElement?.focus(), 100);
    }
  }

  onEnter(evt: Event) {
    const e = evt as KeyboardEvent;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit() {
    if (this.chatForm.invalid || this.streaming()) return;
    const message = (this.chatForm.get('message')?.value || '').trim();
    if (!message) return;

    this.messages.update(list => [...list, { role: 'user', content: message, createdAt: new Date() }]);
    this.chatForm.reset();
    this.scrollToBottom();

    const assistantIndex = this.messages().length;
    this.messages.update(list => [...list, { role: 'assistant', content: '', createdAt: new Date() }]);

    this.streaming.set(true);
    const options = this.customerPrompt() ? { prompt: this.customerPrompt() } : undefined;
    
    this.streamSub = this.chat.stream(message, options).subscribe({
      next: (chunk) => {
        const arr = [...this.messages()];
        arr[assistantIndex] = { ...arr[assistantIndex], content: (arr[assistantIndex].content || '') + chunk };
        this.messages.set(arr);
        this.scrollToBottom();
      },
      error: () => this.streaming.set(false),
      complete: () => this.streaming.set(false)
    });
  }

  autoResize(evt?: Event) {
    const el = (evt?.target as HTMLTextAreaElement) || this.messageInput?.nativeElement;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
