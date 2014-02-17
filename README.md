# mlabs-angular

Angular JS project
dependencies - mongodb,nodejs
## Install


install with `nodejs`
npm install

##Documentation for Api

####Adding a group
        url: /api/group
        method: Post

#####Required params:
        name - String
#####Optional parameters:
        title - String
        description - String

#####Sample code in angular js to use the api
```
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
```
		
 
