const servicesList = [
    { name: "جميع خدمات نقل العفش", url: "/services/" },
    { name: "نقل عفش بجدة", url: "/furniture-moving-in-jeddah/" },
    { name: "تغليف العفش", url: "/furniture-packing-jeddah/" },
    { name: "فك وتركيب الأثاث", url: "/furniture-assembly-jeddah/" },
    { name: "تخزين الأثاث", url: "/furniture-storage-in-jeddah/" },
    { name: "نقل المكاتب والشركات", url: "/office-and-company-moving-jeddah/" },
    { name: "نقل الأجهزة الكهربائية", url: "/electrical-appliances-moving-jeddah/" },
    { name: "نقل غرف النوم بجدة", url: "/bedroom-moving-jeddah/" },
    { name: "نقل المطابخ بجدة", url: "/kitchen-moving-jeddah/" },
    { name: "دينا نقل عفش بجدة", url: "/furniture-moving-truck-in-jeddah/" }
];

document.addEventListener("DOMContentLoaded", () => {
    const desktopDropdown = document.getElementById("desktop-services-dropdown");
    const mobileDropdown = document.getElementById("mobile-services-dropdown");

    if (desktopDropdown && desktopDropdown.children.length === 0) {
        servicesList.forEach(service => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${service.url}" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition">${service.name}</a>`;
            desktopDropdown.appendChild(li);
        });
    }

    if (mobileDropdown && mobileDropdown.children.length === 0) {
        servicesList.forEach(service => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${service.url}" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition border-b border-gray-100 last:border-0">${service.name}</a>`;
            mobileDropdown.appendChild(li);
        });
    }

});
