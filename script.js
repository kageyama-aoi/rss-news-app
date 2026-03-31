async function loadNews(){

 const res = await fetch("/api/news")
 const data = await res.json()

 const list = document.getElementById("news")
 list.innerHTML = ""

 data.forEach(article => {

  const li = document.createElement("li")

  li.innerHTML =
   `<a href="${article.link}" target="_blank">
     ${article.title}
    </a>`

  list.appendChild(li)

 })

}