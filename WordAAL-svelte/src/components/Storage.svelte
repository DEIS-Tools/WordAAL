<script lang="ts">
    import {strategyStore} from '../stores/stores.js'

    const cookieName = 'WordaalCookie';

    const defaultCookieData: WordaalCookie = {
        SameSite: 'Lax',
        expires: 'Thu, 01 Jan 1970 00:00:00 UTC',
        path: '/',
        info: true,
        strategy: 'cons',
        hard: true,
    };

    interface WordaalCookie {
        SameSite: string;
        expires: string;
        path: string;
        info: boolean;
        strategy: string;
        hard: boolean;
    }

    function readWordaalCookie(cookieName: string = cookieName): WordaalCookie | null {
        const cookieValue = document.cookie
            .split(';')
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith(`${cookieName}=`));

        if (cookieValue) {
            const encodedData = cookieValue.split('=')[1];
            const decodedData = decodeURIComponent(encodedData);
            return JSON.parse(decodedData);
        }

        return null;
    }

    export function writeWordaalCookie(cookieName: string = cookieName, cookieData: WordaalCookie = defaultCookieData, expirationDays: number = 7): void {
        const encodedData = encodeURIComponent(JSON.stringify(cookieData));
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);
        document.cookie = `${cookieName}=${encodedData}; expires=${expirationDate.toUTCString()}; path=/`;
    }

    // when strategy changes, update cookie
    strategyStore.subscribe((strategy: object) => {
        console.log(strategy)
        if (strategy === undefined || strategy.s.name === undefined) return;
        let cookieData = readWordaalCookie(cookieName) || defaultCookieData;
        cookieData.strategy = strategy.s.name;
        cookieData.hard = strategy.hard;

        writeWordaalCookie(cookieName, cookieData);
        console.warn('cookie updated', document.cookie, cookieData);
    });


</script>