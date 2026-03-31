export default async function handler(req, res) {

 const rssUrl =
  "https://news.yahoo.co.jp/rss/topics/top-picks.xml"

 const response = await fetch(rssUrl)
 const xml = await response.text()

 const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)]
 const links  = [...xml.matchAll(/<link>(.*?)<\/link>/g)]

 const news = []

 for(let i=1;i<titles.length;i++){

  news.push({
   title: titles[i][1],
   link: links[i][1]
  })

 }

 res.status(200).json(news)

}