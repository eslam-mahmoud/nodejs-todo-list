var items_count = 0;
$(document).ready(function(){

	//register user
	$('form#register').submit(function(e){
		e.preventDefault();
		$.ajax({
			type: 'POST',
			data: $('form#register').serialize(),
			url: '/api/user/create',
			success: function(data){
				if (data.msg == 'OK') {
					window.location = "/";
				} else {
					alert('Error !');
				}
			}
		});
		return false;
	});

	//register user
	$('form#login').submit(function(e){
		e.preventDefault();
		$.ajax({
			type: 'POST',
			data: $('form#login').serialize(),
			url: '/api/user/login',
			success: function(data){
				if (data.msg == 'OK') {
					window.location = "/";
				} else {
					alert('Error !');
				}
			}
		});
		return false;
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
	$('.items').on('click', '.checkbox', function(){
		var item_id = $(this).parents('.item').attr('id');
		var item_title = $(this).next('.title').text();
		var item_done = $(this).is(':checked');
		var data = {id: item_id, title: item_title, done: item_done}

		updateItem(data);
	});

	$('.items').on('dblclick', '.item span.title', function(){
		console.log($(this));
		$(this).parents('.item').children('.edit').show();
	});

	$('.items').on('submit', '.edit form', function(e) {
		e.preventDefault();
		var item_title = $(this).children('input').val();
		$(this).parents('.item').children('.title').html(item_title);
		var item_id = $(this).parents('.item').attr('id');
		var item_done = $(this).is(':checked');
		var data = {id: item_id, title: item_title, done: item_done}

		updateItem(data);
		$(this).parents('.edit').hide();
	});

	$('.items').on('click', 'a.destroy', function(e){
		e.preventDefault();
		var item_id = $(this).parents('.item').attr('id');
		$.ajax({
			type: 'POST',
			url: '/api/todo/delete',
			data: {id: item_id},
			success: function(data){
				if (data.msg == 'OK') {
					if (!$('.items #'+item_id+ ' .checkbox').is(':checked')) {
						items_count--;
					}
					$('.items #'+item_id).remove();
					updateItemCount();
				} else {
					alert('Error !');
				}
			}
		});
	});
});

function getAllItems() {
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
}

function updateItem(post_data) {
	$.ajax({
		type: 'POST',
		url: '/api/todo/update',
		data: post_data,
		success: function(data){
			if (data.msg == 'OK') {
				if (data.item.done) {
					$('.item#'+data.item._id).addClass('done');
					items_count--;
				} else {
					$('.item#'+data.item._id).removeClass('done');
					items_count++;
				}
				$('.items #'+data.item._id).replaceWith(itemTemplate(data.item));
				updateItemCount();
			} else {
				alert('Error !');
			}
		}
	});
}

function updateItemCount() {
	$('.countVal').text(items_count);
}

function itemTemplate(data) {
	var item = '<div id="'+data._id+'" class="item '+(data.done?'done':'')+'">';
		item += '<div class="view" title="Double click to edit...">';
			item += '<input class="checkbox" type="checkbox" '+(data.done?'checked="checked"':'')+'>';
			item += '<span class="title">'+data.title+'</span> <a class="destroy"></a>';
		item += '</div>';
		item += '<div class="edit">';
			item += '<form><input type="text" value="'+data.title+'"> </form>';
		item += '</div>';
	item += '</div>';

	return item;
}