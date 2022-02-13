export class VcsAccountRegisteringModal {
    registerAccount(oauthAuthorizationUrl: string): Promise<void> {
        return new Promise(resolve => {
            const modal = window.open(oauthAuthorizationUrl, "Add Account", "popup,width=930,height=680")
            const interval = setInterval(() => {
                if (modal?.closed) {
                    clearInterval(interval)
                    resolve()
                }
            }, 300)
        })
    }
}
