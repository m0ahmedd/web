const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
};


exports.getDayName = function (date = new Date(), locale = "en-US"){
    return date.toLocaleDateString(locale, options);
}
