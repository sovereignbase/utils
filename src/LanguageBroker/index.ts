import type { BCP47LanguageTag } from '../BCP47LanguageTag/index.js'

/**
 * Stores the active language and notifies consumers when it changes.
 *
 * Each call to {@link LanguageBroker.set | set} updates the stored BCP 47
 * language tag, invokes the optional change callback, and dispatches a typed
 * `change` event.
 *
 * Requires the standard `EventTarget` and `CustomEvent` globals.
 *
 * @example
 * ```ts
 * const languages = new LanguageBroker(
 *   'en-US',
 *   ['en-US', 'fi-FI'],
 *   (language) => {
 *     document.documentElement.lang = language
 *   }
 * )
 *
 * languages.addEventListener('change', (event) => {
 *   console.log(event.detail)
 * })
 *
 * languages.set('fi-FI')
 * ```
 *
 * @typeParam SupportedLanguages - The readonly list whose entries determine the supported language union.
 */
export class LanguageBroker<
  const SupportedLanguages extends readonly BCP47LanguageTag[],
> {
  private readonly supportedLanguages: ReadonlySet<SupportedLanguages[number]>
  private readonly eventTarget: EventTarget = new EventTarget()
  private readonly onchange:
    undefined | ((language: SupportedLanguages[number]) => void)
  private language: SupportedLanguages[number]

  /**
   * Creates a language broker.
   *
   * @param initialLanguage - A supported language returned by {@link LanguageBroker.get | get} until the first update.
   * @param supportedLanguages - The languages accepted by {@link LanguageBroker.set | set}, in iteration order.
   * @param onchange - An optional callback invoked with the new language on every update.
   */
  constructor(
    initialLanguage: SupportedLanguages[number],
    supportedLanguages: SupportedLanguages,
    onchange?: (language: SupportedLanguages[number]) => void
  ) {
    this.supportedLanguages = new Set(supportedLanguages)
    this.language = initialLanguage
    this.onchange = onchange
  }

  /** Returns the active language. */
  public get(): SupportedLanguages[number] {
    return this.language
  }

  /** Returns the supported languages in constructor order. */
  public list(): SetIterator<SupportedLanguages[number]> {
    return this.supportedLanguages.values()
  }

  /**
   * Updates the active language and notifies all consumers.
   *
   * Languages outside the supported list are ignored at runtime.
   *
   * @param language - The new active language from the supported language list.
   */
  public set(language: SupportedLanguages[number]): void {
    if (!this.supportedLanguages.has(language)) return
    this.language = language
    this.onchange?.(language)
    void this.eventTarget.dispatchEvent(
      new CustomEvent<SupportedLanguages[number]>('change', {
        detail: language,
      })
    )
  }

  /**
   * Registers a listener for typed language events.
   *
   * @param type - The language event type.
   * @param listener - The listener to register.
   * @param options - Standard DOM event listener options.
   */
  public addEventListener<
    K extends keyof LanguageEventMap<SupportedLanguages[number]>,
  >(
    type: K,
    listener: LanguageEventListenerFor<SupportedLanguages[number], K> | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    return void this.eventTarget.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }

  /**
   * Removes a previously registered language event listener.
   *
   * @param type - The language event type.
   * @param listener - The listener to remove.
   * @param options - Standard DOM event listener options.
   */
  public removeEventListener<
    K extends keyof LanguageEventMap<SupportedLanguages[number]>,
  >(
    type: K,
    listener: LanguageEventListenerFor<SupportedLanguages[number], K> | null,
    options?: boolean | EventListenerOptions
  ): void {
    return void this.eventTarget.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }
}

/**
 * Maps each event dispatched by {@link LanguageBroker} to its
 * `CustomEvent.detail` value.
 *
 * @typeParam SupportedLanguage - The language union carried by broker events.
 */
export type LanguageEventMap<
  SupportedLanguage extends BCP47LanguageTag = BCP47LanguageTag,
> = {
  change: SupportedLanguage
}

/**
 * A function or object that handles a typed {@link LanguageBroker} event.
 *
 * @typeParam SupportedLanguage - The language union carried by broker events.
 * @typeParam K - The event type.
 */
export type LanguageEventListener<
  SupportedLanguage extends BCP47LanguageTag = BCP47LanguageTag,
  K extends keyof LanguageEventMap<SupportedLanguage> =
    keyof LanguageEventMap<SupportedLanguage>,
> =
  | ((event: CustomEvent<LanguageEventMap<SupportedLanguage>[K]>) => void)
  | {
      handleEvent(
        event: CustomEvent<LanguageEventMap<SupportedLanguage>[K]>
      ): void
    }

/**
 * Resolves a typed {@link LanguageBroker} listener for known language events
 * and a standard DOM event listener for other event names.
 *
 * @typeParam SupportedLanguage - The language union carried by broker events.
 * @typeParam K - The event type.
 */
export type LanguageEventListenerFor<
  SupportedLanguage extends BCP47LanguageTag = BCP47LanguageTag,
  K extends string = string,
> = K extends keyof LanguageEventMap<SupportedLanguage>
  ? LanguageEventListener<SupportedLanguage, K>
  : EventListenerOrEventListenerObject
