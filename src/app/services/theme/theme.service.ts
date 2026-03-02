import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PwaStyle } from 'src/app/core/interface/api.interface';

const STORAGE_KEY = 'pwaStyle';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    /** Broadcast the active pwaStyle so interested components can react */
    activeStyle$ = new BehaviorSubject<PwaStyle | null>(null);

    /**
     * Called once on app startup (AppComponent.ngOnInit).
     * Restores persisted style from localStorage, falling back to env defaults.
     */
    applyFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const pwaStyle: PwaStyle | null = stored ? JSON.parse(stored) : null;
            this.applyPwaStyle(pwaStyle);
        } catch {
            this.applyEnvDefaults();
        }
    }

    /**
     * Called after a successful login with the pwaStyle object from the API.
     * Any null / undefined field falls back to the environment default.
     */
    applyPwaStyle(pwaStyle: PwaStyle | null): void {
        const env = environment as any;

        const primary = pwaStyle?.primaryColor ?? env.primaryColor ?? null;
        const hover = pwaStyle?.hoverColor ?? env.hoverColor ?? null;
        const logo = pwaStyle?.sidebarLogo ?? env.companyLogo ?? null;

        const root = document.documentElement;

        if (primary) root.style.setProperty('--main-color', primary);
        if (hover) root.style.setProperty('--hover-color', hover);

        // Extended brand tokens (keep existing env-based tokens intact if not in pwaStyle)
        const secondary = (env as any).secondaryColor;
        if (secondary) root.style.setProperty('--second-color', secondary);
        if (env.bodyBg) root.style.setProperty('--body-bg', env.bodyBg);
        if (env.sectionHeaderBg) root.style.setProperty('--section-header-bg', env.sectionHeaderBg);
        if (env.sectionHeaderShadow) root.style.setProperty('--section-header-shadow', env.sectionHeaderShadow);
        if (env.cardBorderRadius) root.style.setProperty('--card-border-radius', env.cardBorderRadius);

        // Persist the resolved pwaStyle so page refreshes restore the same look
        const resolved: PwaStyle = {
            primaryColor: primary,
            hoverColor: hover,
            sidebarLogo: logo,
            sidebarText: pwaStyle?.sidebarText ?? null,
            sidebarLogoWidth: pwaStyle?.sidebarLogoWidth ?? null,
            sidebarLogoHeight: pwaStyle?.sidebarLogoHeight ?? null,
            sidebarBackgroundColor: pwaStyle?.sidebarBackgroundColor ?? null,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
        this.activeStyle$.next(resolved);
    }

    /** Applies only the static environment defaults — used as a standalone reset. */
    private applyEnvDefaults(): void {
        this.applyPwaStyle(null);
    }
}
