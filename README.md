# mlabs-angular
=============

Angular JS project

## Install

install with `nodejs`
npm install

##Documentation for Api

Adding a group
url: /api/group
method: Post

required params:
name - String
optional parameters:
title - String
description - String

$http({
	method:'POST', 
	url:'/api/group', 
	data:{
		name:'groupName', 
		title:'groupTitle',
		description:'groups description'
		}
	}).success(function(resp)){
		//resp.data contains the newly created group
	});
		
 