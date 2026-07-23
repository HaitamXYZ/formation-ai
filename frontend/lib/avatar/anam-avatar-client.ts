"use client";

import { AnamEvent, ConnectionClosedCode, MessageRole, createClient } from "@anam-ai/js-sdk";
import type { AnamClient, EventCallbacks, InputAudioState, Message } from "@anam-ai/js-sdk";

export type AnamAvatarClientCallbacks = {
  onReady: () => void;
  onConnectionClosed: (reason: string) => void;
  onMicrophonePending: () => void;
  onMicrophoneGranted: () => void;
  onMicrophoneDenied: (message: string) => void;
  onUserSpeechStarted: () => void;
  onUserSpeechEnded: () => void;
  onMessageHistoryUpdated: (messages: Message[]) => void;
  onTalkInterrupted: () => void;
  onError: (message: string) => void;
};

export class AnamAvatarClient {
  private client: AnamClient | null = null;
  private listenerCleanups: Array<() => void> = [];
  private readonly videoElementId: string;
  private readonly callbacks: AnamAvatarClientCallbacks;

  public constructor(videoElementId: string, callbacks: AnamAvatarClientCallbacks) {
    this.videoElementId = videoElementId;
    this.callbacks = callbacks;
  }

  public async start(sessionToken: string): Promise<void> {
    if (this.client?.isStreaming()) {
      return;
    }

    const client = createClient(sessionToken, {
      disableInputAudio: false,
    });

    this.client = client;
    this.registerListeners(client);
    await client.streamToVideoElement(this.videoElementId);
  }

  public async stop(): Promise<void> {
    if (!this.client) {
      return;
    }

    const currentClient = this.client;
    this.client = null;
    this.listenerCleanups.forEach((cleanup) => cleanup());
    this.listenerCleanups = [];
    await currentClient.stopStreaming();
  }

  public async talk(text: string): Promise<void> {
    if (!this.client?.isStreaming() || !text.trim()) {
      return;
    }

    await this.client.talk(text);
  }

  public interrupt(): void {
    if (!this.client?.isStreaming()) {
      return;
    }

    this.client.interruptPersona();
  }

  public mute(): InputAudioState | null {
    if (!this.client) {
      return null;
    }

    return this.client.muteInputAudio();
  }

  public unmute(): InputAudioState | null {
    if (!this.client) {
      return null;
    }

    return this.client.unmuteInputAudio();
  }

  public isStreaming(): boolean {
    return this.client?.isStreaming() ?? false;
  }

  private registerListeners(client: AnamClient) {
    this.addListener(client, AnamEvent.SESSION_READY, () => {
      this.callbacks.onReady();
    });

    this.addListener(client, AnamEvent.CONNECTION_CLOSED, (reason: ConnectionClosedCode, details?: string) => {
      this.callbacks.onConnectionClosed(details ? `${reason}: ${details}` : reason);
    });

    this.addListener(client, AnamEvent.MIC_PERMISSION_PENDING, () => {
      this.callbacks.onMicrophonePending();
    });

    this.addListener(client, AnamEvent.MIC_PERMISSION_GRANTED, () => {
      this.callbacks.onMicrophoneGranted();
    });

    this.addListener(client, AnamEvent.MIC_PERMISSION_DENIED, (error: string) => {
      this.callbacks.onMicrophoneDenied(error);
    });

    this.addListener(client, AnamEvent.USER_SPEECH_STARTED, () => {
      this.callbacks.onUserSpeechStarted();
    });

    this.addListener(client, AnamEvent.USER_SPEECH_ENDED, () => {
      this.callbacks.onUserSpeechEnded();
    });

    this.addListener(client, AnamEvent.MESSAGE_HISTORY_UPDATED, (messages: Message[]) => {
      this.callbacks.onMessageHistoryUpdated(messages);
    });

    this.addListener(client, AnamEvent.TALK_STREAM_INTERRUPTED, () => {
      this.callbacks.onTalkInterrupted();
    });

    this.addListener(client, AnamEvent.SERVER_WARNING, (message: string) => {
      this.callbacks.onError(message);
    });
  }

  private addListener<K extends AnamEvent>(client: AnamClient, event: K, callback: EventCallbacks[K]) {
    client.addListener(event, callback);
    this.listenerCleanups.push(() => client.removeListener(event, callback));
  }
}

export function getLatestUserMessage(messages: Message[]): Message | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === MessageRole.USER && message.content.trim()) {
      return message;
    }
  }
  return null;
}
