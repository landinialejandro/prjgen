function get_file(file) {
	const promise = new Promise(function (resolve, reject) {
		if (file) {
			$.get(file)
				.done(function (data) {
					resolve(data);
				});
		}
		if (!file) {
			reject(new Error('Not exist file'));
		}
	});
	return promise;
}

function get_data(url="starter.php", data = { operation: "test", id: "#", text: "test ajax works" }) {
	const promise = new Promise(function (resolve, reject) {
		if (data && url) {
			$.get(url, data)
				.done(function (res) {
					resolve(res.content);
				});
		}
		if (!data || !url) {
			reject(new Error('url/data needed'));
		}
	});
	return promise;
}

function expandContainer(selector,$this){
  var container = $(selector);
	if (container.hasClass('active')) {

		container.slideUp("slow");
		container.removeClass('active');
		$($this).text('+');

	} else {
		container.slideDown("slow");
		container.addClass('active');
		$($this).text('-');
	}
}