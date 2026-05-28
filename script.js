
window.addEventListener("scroll", () => {
    document.querySelectorAll("section").forEach(section => {
        const top = window.scrollY;
        const offset = section.offsetTop - 200;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");

        if (top >= offset && top < offset + height) {
            document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
            const link = document.querySelector(`nav a[href="#${id}"]`);
            if (link) link.classList.add("active");
        }
    });
});

/* typing effect */
const text = ["GO-lang разработчик", "Системный администратор", "Эксперт по интеграциям"];
let i = 0, j = 0, current = "";
const el = document.getElementById("typing");

function type() {
    if (i < text.length) {
        if (j < text[i].length) {
            current += text[i][j];
            el.innerText = current;
            j++;
            setTimeout(type, 50);
        } else {
            setTimeout(() => {
                current = "";
                j = 0;
                i++;
                type();
            }, 1000);
        }
    } else {
        i = 0;
        type();
    }
}
type();

/* scroll animation */
const sections = document.querySelectorAll("section");
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("show");
        }
    });
});
sections.forEach(s => obs.observe(s));

/* GitHub API */
fetch("https://api.github.com/users/yelta1/repos?sort=updated")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("repos");

        if (!container) {
            console.error("Container #repos not found");
            return;
        }

        data.slice(0, 6).forEach(repo => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
        <strong>${repo.name}</strong><br>
        ${repo.description || "Описание отсутствует"}<br><br>
        ⭐ ${repo.stargazers_count} | Forks: ${repo.forks_count}<br><br>
        <a href="${repo.html_url}" target="_blank">Открыть</a>
      `;

            container.appendChild(card);
        });
    })
    .catch(err => {
        console.log("GitHub API error:", err);
    });


const blobs = document.querySelectorAll('.blob');

let mouseX = 0;
let mouseY = 0;
let scrollYPos = 0;

window.addEventListener('scroll', () => {
    scrollYPos = window.scrollY;
    updateBlobs();
});

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
    updateBlobs();
});

function updateBlobs() {
    blobs.forEach((blob, i) => {
        const moveX = mouseX * 30 * (i + 1);
        const moveY = mouseY * 30 * (i + 1);
        const scrollOffset = scrollYPos * (0.05 + i * 0.02);

        blob.style.transform = `
                translate(${moveX}px, ${moveY + scrollOffset}px)
                scale(1)
            `;
    });
}

document.addEventListener('click', (e) => {
    const drop = document.createElement('div');
    drop.className = 'drop';

    const blob = document.querySelector('.b1');
    const rect = blob.getBoundingClientRect();

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const endX = e.clientX;
    const endY = e.clientY;

    drop.style.left = startX + 'px';
    drop.style.top = startY + 'px';

    document.body.appendChild(drop);

    const dx = endX - startX;
    const dy = endY - startY;

    const fly = drop.animate([
        {
            transform: `translate(0,0) scale(1)`
        },
        {
            transform: `translate(${dx}px, ${dy}px) scale(1.1)`
        }
    ], {
        duration: 500,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    });
    fly.onfinish = () => {
        drop.animate([
            {
                transform: `translate(${dx}px, ${dy}px) scale(1)`
            },
            {
                transform: `translate(${dx}px, ${dy + 300}px) scale(0.6)`
            }
        ], {
            duration: 1000,
            easing: "ease-in",
            fill: "forwards"
        });

        // плавное исчезновение
        drop.style.transition = "opacity 0.7s";
        drop.style.opacity = "0";

        setTimeout(() => drop.remove(), 700);
    };
});

