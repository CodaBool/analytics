const date = new Date()
date.setDate(1) // set to first of the month

const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    'X-AUTH-EMAIL': process.env.EMAIL,
    'X-AUTH-KEY': process.env.CLOUDFLARE_API_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `{
      viewer {
        accounts(filter: { accountTag: "${process.env.CLOUDFLARE_ACCOUNT}" }) {
          r2OperationsAdaptiveGroups(
            filter: { datetime_geq: "${date.toISOString()}" }
            limit: 9999
          ) {
            dimensions {
              actionType
            }
            sum {
              requests
            }
          }
        }
      }
    }`
  })
})

const body = await res.json()
const classA = ["ListBuckets", "PutBucket", "ListObjects", "PutObject", "CopyObject", "CompleteMultipartUpload", "CreateMultipartUpload", "ListMultipartUploads", "UploadPart", "UploadPartCopy", "ListParts", "PutBucketEncryption", "PutBucketCors", "PutBucketLifecycleConfiguration"]
const classB = ["HeadBucket", "HeadObject", "GetObject", "UsageSummary", "GetBucketEncryption", "GetBucketLocation", "GetBucketCors", "GetBucketLifecycleConfiguration"]
let [classATotal, classBTotal] = [0, 0]
body.data.viewer.accounts[0].r2OperationsAdaptiveGroups.forEach(item => {
  if (classA.includes(item.dimensions.actionType)) {
    classATotal += item.sum.requests
  } else if (classB.includes(item.dimensions.actionType)) {
    classBTotal += item.sum.requests
  }
})

const aUsage = Math.round((classATotal / 1_000_000) * 100)
const bUsage = Math.round((classBTotal / 10_000_000) * 100)

const storage = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    'X-AUTH-EMAIL': process.env.EMAIL,
    'X-AUTH-KEY': process.env.CLOUDFLARE_API_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `{
      viewer {
        accounts(filter: { accountTag: "${process.env.CLOUDFLARE_ACCOUNT}" }) {
          r2StorageAdaptiveGroups(
            limit: 9999
            filter: { datetime_geq: "${date.toISOString()}" }
          ) {
            max {
              payloadSize
            }
          }
        }
      }
    }`
  })
})


const bodyStorage = await storage.json()
const bytes = bodyStorage.data.viewer.accounts[0].r2StorageAdaptiveGroups[0].max.payloadSize
const gigabytes = bytes / 1e9
const megabytes = bytes / 1e6
const bytesUsage = Math.round((gigabytes / 10) * 100)
const subject = `R2 read=${aUsage}% write=${bUsage}% storage=${bytesUsage}%`

const value = `Detailed Summary
- read = ${aUsage}%
- read operations = ${classATotal}
- write = ${bUsage}%
- write operations = ${classBTotal}
- storage = ${bytesUsage}%
- storage size = ${megabytes}Mb`


let severity = null
if (aUsage > 50 || bUsage > 50 || bytesUsage > 50) {
  // high usage
  severity = "Warning"
} else if (new Date().getUTCDay() === 1) {
  // weekly Monday report
  severity = "Cozy"
}

console.log("severity=",severity)
console.log(subject)
console.log(value)