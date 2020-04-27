import Worker from 'worker-loader!./handler'

const worker = new Worker()

function call<R>(cmd: string, ...args: unknown[]): Promise<R> {
    return new Promise<R>((resolve, reject) => {
        worker.postMessage([cmd, args])
        worker.onmessage = ev => {
            const [result, err] = ev.data
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        }
    })
}

export function collectEntropy() {
    return call<Int16Array>('collectEntropy')
}

export function hdGenerateMnemonic(len = 32) {
    return call<string[]>('hdGenerateMnemonic', len)
}

export function hdDeriveMnemonic(words: string[], index: number) {
    return call<[Uint8Array, Uint8Array, string, Uint8Array]>('hdDeriveMnemonic', words, index)
        .then(r => {
            const [pub, chainCode, address, privateKey] = r
            return {
                pub: Buffer.from(pub),
                chainCode: Buffer.from(chainCode),
                address,
                privateKey: Buffer.from(privateKey)
            }
        })
}

export function hdDeriveXPub(pub: Buffer, chainCode: Buffer, index: number) {
    return call<[Uint8Array, Uint8Array, string]>('hdDeriveXPub', pub, chainCode, index)
        .then(r => {
            const [pub, chainCode, address] = r
            return {
                pub: Buffer.from(pub),
                chainCode: Buffer.from(chainCode),
                address
            }
        })
}

export function kdf(password: string, salt: Buffer, n: number) {
    return call<Uint8Array>('kdf', password, salt, n)
        .then(k => Buffer.from(k))
}
