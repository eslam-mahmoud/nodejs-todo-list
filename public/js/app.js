var items_count = 0;
$(document).ready(function(){
	//get all items
	$.ajax({
		type: 'GET',
		url: '/api/todo/get',
		success: function(data){
			items_count = 0;
			for (index in data) {
				if (!data[index].done) {
					items_count++;
				}
				$('.items').append(itemTemplate(data[index]));
			}
			updateItemCount();
		}
	});

	//add item
	$('form#todo').submit(function(e){
		e.preventDefault();
		$.ajax({
			type: 'POST',
			data: $('form#todo').serialize(),
			url: '/api/todo/create',
			success: function(data){
				if (data.msg == 'OK') {
					items_count++;
					$('#title').val('');
					$('.items').append(itemTemplate(data.item));
					updateItemCount();
				} else {
					alert('Error !');
				}
			}
		});
		return false;
	});

	//update item status
	$('.checkbox').on('click', function(){
		var item_id = $(this).parents('.item').attr('id');
		var item_title = $(this).next('.title').text();
		var item_done = $(this).is(':checked');
		$.ajax({
			type: 'POST',
			data: {id: item_id, title: item_title, done: item_done},
			url: '/api/todo/update',
			success: function(data){
				if (data.msg == 'OK') {
					items_count++;
					$('#title').val('');
					$('.items').append(itemTemplate(data.item));
					updateItemCount();
				} else {
					alert('Error !');
				}
			}
		});
	});
});

function updateItemCount() {
	$('.countVal').text(items_count);
}

function itemTemplate(data) {
	var item = '<div id="'+data.id+'" class="item '+(data.done?'done':'')+'">';
		item += '<div class="view" title="Double click to edit...">';
			item += '<input class="checkbox" type="checkbox" '+(data.done?'checked="checked"':'')+'>';
			item += '<span class="title">'+data.title+'</span> <a class="destroy"></a>';
		item += '</div>';
		item += '<div class="edit">';
			item += '<input type="text" value="'+data.title+'">';
		item += '</div>';
	item += '</div>';

	return item;
}