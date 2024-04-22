
const hidePreloader = () => {
    var spinnerWrapper = document.querySelector(".spinner-wrapper")
    setTimeout(() => {
        spinnerWrapper.style.opacity = 0
        setTimeout(() => spinnerWrapper.style.display = "none", 500)
    }, 600)
}

//enable or disable containers
function Container(enable = true) {
    if (enable) {
        setTimeout(() => $(".container-disabled").removeClass("container-disabled"), 200)
    } else {
        $(".card-starter").addClass("container-disabled");
        ws().addClass("container-disabled");
    }
}

/**
 * get date for last starter version
 */
const get_settings = async () => {
    let data = {
        operation: "settings-data",
        id: "#",
    }
    return new Promise((resolve, reject) => {
        get_data({ url: "starter.php", data })
            .then(({ content }) => {
                if (!content) {
                    reject(new error(`error to get version`))
                } else {
                    resolve(content)
                }
            })
    })
}

const setBreadCrum = (newBreadCrum) => {
    $(".breadcrumb-item.active").text(newBreadCrum)
}
const setTitleFileSelected = (newTitle) => {
    $(".title-file-selected").text(newTitle)
}