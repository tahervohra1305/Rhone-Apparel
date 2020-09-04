/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

/*************************************************************
 * File Header
 * Script Type: Map Reduce Script
 * Script Name: RH_MRS_AssignLocations.js
 * File Name: RH_MRS_AssignLocations.js
 * Created On: 1 July 2020
 * Modified On: 1 July 2020
 * Created By: Rujuta K (Yantra Inc.)
 * Modified By: 
 * Description: Assign the location on items based on some conditions.
 *********************************************************** */
 
 define(['N/record', 'N/search', 'N/runtime', 'N/email','N/format','N/file','N/task'],

function(record, search, runtime, email,format,file,task) 
{
    var orderIds=[];
	var a_CAinventory=[];
	var a_USInventory=[];
	var a_CASOID=[];
	var a_USSOID=[];
	var a_itemarray=[];
	
	var s_averagecost=[];
	var i_remainingqty=0;
	
	
    function getInputData() 
	{
    	try
		{
			var scriptObj = runtime.getCurrentScript();
            log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
			//var orderIds=[];
			var s_savesearchId = runtime.getCurrentScript().getParameter({
    	           name: 'custscript_rh_sosavesearch_id'
    	    });
			var searchItem = search.load({id: s_savesearchId});
			log.debug('searchItem: ', searchItem);
			
			var searchResultCount = searchItem.runPaged().count;
		    log.debug('searchResultCount: ', searchResultCount);
			
			searchItem.run().each(function(result)
						{
						
							orderIds.push(result)
							return true;
						});
		
		  log.debug('orderIds: ', orderIds);
		
		  return orderIds;
		  	
    	}
    	catch(ex){
    		log.error('getInputData error: ', ex.message);	
    	}
    }

    function map(context) 
	{
	//	log.debug('In MAP: ');
		//log.debug('In MAP: ');
		var key=context.key
		  //log.debug("key=== ", key);
	   var headerSearchResult = context.value;
	    //log.debug("map=== ", headerSearchResult);
		context.write(key,headerSearchResult); 
		
    }

    function reduce(context) 
	{
		log.debug("reduce=== ");
		var scriptObj = runtime.getCurrentScript();
        log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
		
		
	  	 context.write({ key: context.key , value: context.values.length }); 
		 log.debug("key: context.key"+context.key);
		 log.debug("context.values"+context.values.length);
		 
		 var s_compareID="";
		 log.debug("headerSearchResult==",headerSearchResult);
			
		
		for (i=0; i<1 ;i++) 
		{
			var result=context.values[i];
			log.debug("result==",result);
			var headerSearchResult = JSON.parse(result);
		try
		{
			if(headerSearchResult)
			{
				var s_type=headerSearchResult.recordType
				log.debug("s_type=== ", s_type);
				
				var s_ID = headerSearchResult.id
				log.debug("s_ID== ", s_ID);
				
				log.debug("i=== ", i);
				
				var s_SOSubsidiary= headerSearchResult.values.subsidiary[0].value
				//log.debug("s_SOSubsidiary%%%%%%%", s_SOSubsidiary);

                var s_SOchannel= headerSearchResult.values.custbody_ravi_channel[0].value
				//log.debug("s_SOchannel%%%%%%%", s_SOchannel);
						
							
				var s_shipCountry = headerSearchResult.values.shipcountry[0].value
				log.debug("s_shipCountry%%%%%%%", s_shipCountry);
				
				var s_isDTCorder=headerSearchResult.values["customer.isperson"]
				log.debug("s_isDTCorder%%%%%%%", s_isDTCorder);
				
				var s_getallInventory=getallInventory(s_ID,s_SOchannel,s_isDTCorder,s_shipCountry)	
				log.debug("s_getallInventory%%%%%%%", s_getallInventory);
				
				var i_split=s_getallInventory.toString().split(",")
			    log.debug("updateSO","i_split*************"+i_split.length);
				
				var i_totalqty=0
				var a_soitemarray=[];
				var a_itemarray=[];
				var a_splitarray=[];
				var s_highestaveragecost=0;
				var s_item_id="";
				 for (var k = 0; k < i_split.length; k++) 
				  {
					  var i_datasplit=i_split[k].toString().split("$$");
					  log.debug("updateSO","i_datasplit*************"+i_datasplit);
					  
					 
						  s_item_id=i_datasplit[0];
						  //log.debug("updateSO","s_item_id*************"+s_item_id);
						  
						  var s_SO_qty=i_datasplit[1];
						  //log.debug("updateSO","s_SO_qty*************"+s_SO_qty);
						  
						  var s_location=i_datasplit[2];
						  //log.debug("updateSO","s_location*************"+s_location);
						  
						  var s_Country=i_datasplit[3];
						  //log.debug("updateSO","s_Country*************"+s_Country);
						  
						  var s_averagecost=i_datasplit[4];
						  log.debug("updateSO","s_averagecost*************"+s_averagecost);
						  log.debug("updateSO","s_highestaveragecost*************"+s_highestaveragecost);
						  
						  var s_availableqty=i_datasplit[5];
						 // log.debug("updateSO","s_availableqty*************"+s_availableqty);
						  
						  var s_locationid=i_datasplit[6];
						 // log.debug("updateSO","s_locationid*************"+s_locationid);
						 
						   var s_stock=i_datasplit[7];
						   log.debug("s_stock","s_stock*************"+s_stock);
						   if(s_shipCountry!="US")
					  { 
						   
					  if(s_Country=="CA")
						{
							if(s_stock=="In Stock")
							{
									  var b_itemflag=a_itemarray.indexOf(s_item_id);
									  log.debug("s_shipCountry!=United States(in CA)","b_itemflag*************"+b_itemflag);
									  if(b_itemflag<=-1)
									  {
										   a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
									  }
									 a_itemarray.push(s_item_id)
							}
							else
							{
							   var b_itemflag=a_itemarray.indexOf(s_item_id);
							   log.debug("s_shipCountry!=United States(in CA)","b_itemflag*************"+b_itemflag);
									  if(b_itemflag<=-1 && s_stock!="In Stock")
									  {	
								          a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
										 /* i_totalqty=parseInt(s_SO_qty)-parseInt(s_availableqty)
										  log.debug("updateSO","i_totalqty*************"+i_totalqty)		
										  
										  if(parseInt(i_totalqty)!=0 && k!=0)
										  {
											   a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+i_totalqty)
										  }
										  else
										  {
											  a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_availableqty)
										  }*/
											
									}
									else if(b_itemflag<=-1)
									{
										 a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
										//a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_availableqty)
									}
							}
								
						}
					   else
						{
							if(s_Country=="US")
							{
									if(s_stock=="In Stock")
									{
									  if(parseFloat(s_highestaveragecost)==0.0)
										{
												// s_averagecost=[];
												 log.debug("In DTC comp","s_averagecost"+s_averagecost);
												 s_highestaveragecost=s_averagecost
												 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
												 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											
										} 
										else if(parseFloat(s_highestaveragecost)>parseFloat(s_averagecost))
										{
											 log.debug("In DTC comp","s_averagecost"+s_averagecost);
											 s_highestaveragecost=s_averagecost
											 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
											 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											 log.debug("updateSO","a_soitemarray*************"+a_soitemarray)
										}
										else
										 {
											 s_highestaveragecost=s_averagecost
											 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											 log.debug("updateSO","a_soitemarray*************"+a_soitemarray)
										 }
									}
									else
									{
										 a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
										/* var b_itemflag=a_itemarray.indexOf(s_item_id);
							             log.debug("s_shipCountry!=United States(in CA)","b_itemflag*************"+b_itemflag);
										  if(b_itemflag<=-1 && s_stock!="In Stock")
										  {	
											if(i_totalqty==0)
											{
											  i_totalqty=parseInt(s_SO_qty)-parseInt(s_availableqty)
											  log.debug("updateSO","i_totalqty*************"+i_totalqty)		
											}
											
											  if(parseInt(i_totalqty)!=0 && k!=0)
											  {
												   a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+i_totalqty)
											  }
											  else
											  {
												  a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_availableqty)
											  }
									  }*/
									}
								
								
							}
											  
						}
					  }
					  else if(s_shipCountry=="US")
					  {
						log.debug("In US");
					    if(s_isDTCorder==true) 
						{
							 log.debug("In DTC","s_highestaveragecost=="+s_highestaveragecost);
						     log.debug("In DTC","s_averagecost=="+s_averagecost);
							 if(s_Country=="CA")
							{
								if(s_stock=="In Stock")
								{
									/*
									if(s_highestaveragecost=="0")
									{
											 log.debug("In DTC comp","s_averagecost"+s_averagecost);
											 s_highestaveragecost=s_averagecost
											 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
											 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											 s_highestaveragecost=s_averagecost
										 
										 
									} 
									else if(parseFloat(s_highestaveragecost)>=parseFloat(s_averagecost))
									{
										 log.debug("In DTC comp","s_averagecost"+s_averagecost);
										 s_highestaveragecost=s_averagecost
										 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
										 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
									}
									else
									 {
										 s_highestaveragecost=s_averagecost
									 }
									 */
									     var b_itemflag=a_itemarray.indexOf(s_item_id);
							             log.debug("s_shipCountry!=United States(in CA)","b_itemflag*************"+b_itemflag);
										 if(k==0 && s_stock=="In Stock")
										 {
											 	a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
								    	        a_itemarray.push(s_item_id)
										 }
										 if(b_itemflag<=-1 && s_stock=="In Stock")
										 {
											a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											a_itemarray.push(s_item_id)
										 }
								}
								else
								{
									 a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
								}
								
							}
							else if(s_Country=="US")
							{
								if(s_stock=="In Stock")
								{
									/*if(s_highestaveragecost=="0")
									{
											// s_averagecost=[];
											 log.debug("In DTC comp","s_averagecost"+s_averagecost);
											 s_highestaveragecost=s_averagecost
											 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
											 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											 s_highestaveragecost=s_averagecost
									} 
									else if(parseFloat(s_highestaveragecost)>=parseFloat(s_averagecost))
									{
										 log.debug("In DTC comp","s_averagecost"+s_averagecost);
										 s_highestaveragecost=s_averagecost
										 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
										 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
									}
									else
									 {
										 s_highestaveragecost=s_averagecost
									 }*/
									  var b_itemflag=a_itemarray.indexOf(s_item_id);
							             log.debug("s_shipCountry!=United States(in CA)","b_itemflag*************"+b_itemflag);
										 if(b_itemflag<=-1&& s_stock=="In Stock")
										 {
											 	a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
								    	        a_itemarray.push(s_item_id)
										 }
										 if(b_itemflag<=-1 && s_stock!="In Stock")
										 {
											a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
											a_itemarray.push(s_item_id)
										 }
								}
								else
								{
									 a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
								}
							}
						}
						else
						{
							if(s_Country=="US")
							{
								if(s_stock=="In Stock")
								{
									//if(s_highestaveragecost=="0")
									//{
									//		 log.debug("In DTC comp","s_averagecost"+s_averagecost);
									//		 s_highestaveragecost=s_averagecost
									//		 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
											 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
									//		 s_highestaveragecost=s_averagecost
									//} 
									//else if(parseFloat(s_highestaveragecost)>=parseFloat(s_averagecost))
									//{
									//	 log.debug("In DTC comp","s_item_averagecost"+s_averagecost);
									//	 s_highestaveragecost=s_averagecost
									//	 log.debug("In DTC comp","s_highestaveragecost"+s_highestaveragecost);
									////	 a_soitemarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"modify"+"##"+s_SO_qty)
									//}
									//else
									// {
									//	 s_highestaveragecost=s_averagecost
									// }
									
								}
								else
								{
									a_splitarray.push(s_ID+"##"+s_item_id+"##"+s_SO_qty+"##"+s_locationid+"##"+"add"+"##"+s_availableqty)
								}
								
							}
							
						}
					  }
			      }
				
				 log.debug("updateSO","a_soitemarray*************"+a_soitemarray)
				 log.debug("updateSO","a_splitarray*************"+a_splitarray)
				 a_splitarray=a_splitarray.reverse()
				  var i_totalqty=0
				 if(a_splitarray.length>0)
				 {
					  var s_soItem="";
					 for (var r = 0; r < a_splitarray.length; r++) 
					  {
						   var i_itemsplit=a_splitarray[r].toString().split("##");
					       log.debug("a_splitarray","i_itemsplit*************"+i_itemsplit)
						  
						   var so_Id=i_itemsplit[0];
						   log.debug("updateSO","so_Id*************"+so_Id);
						   
						   s_soItem=i_itemsplit[1];
						   log.debug("updateSO","s_soItem*************"+s_soItem);
						   
						   var s_qty=i_itemsplit[5];
						   log.debug("updateSO","s_qty*************"+s_qty);
						   
						   var s_location=i_itemsplit[3];
						   log.debug("updateSO","s_location*************"+s_location);
						   
						   var s_addlineflag=i_itemsplit[4];
						   log.debug("updateSO","s_addlineflag*************"+s_addlineflag);
						   
						   var i_originalqty=i_itemsplit[2];
						   log.debug("updateSO","i_originalqty*************"+i_originalqty);
						   
						   if(i_totalqty==0)
						   {
							   if(parseInt(i_originalqty)>=parseInt(s_qty))
							   {
								   i_totalqty=parseInt(i_originalqty)-parseInt(s_qty)
								   log.debug("a_splitarray","i_totalqty*************"+i_totalqty)
								   a_soitemarray.push(so_Id+"##"+s_soItem+"##"+i_originalqty+"##"+s_location+"##"+"modify"+"##"+s_qty)
							   }
						   }
						  else
						  {
						    if(parseInt(s_qty)>parseInt(i_totalqty))
							{
						    log.debug("a_splitarray","add i_totalqty*************"+i_totalqty)
						    a_soitemarray.push(so_Id+"##"+s_soItem+"##"+i_originalqty+"##"+s_location+"##"+"add"+"##"+i_totalqty)
							}
						  }
						   
						  
					  }
				 }
				  log.debug("a_splitarray%%%%%%%","a_soitemarray*************"+a_soitemarray)
				 var o_SO_Record ="";
				 var i_totlaqtyflag="";
				 var i_checkqty=0;
				 var i_SOqty=0;
				 var i_locationarr=[];
				 if(a_soitemarray.length>0)
				 {
					 for (var q = 0; q < a_soitemarray.length; q++) 
					  {
						  log.debug("updateSO","q*************"+q);
						   var i_itemsplit=a_soitemarray[q].toString().split("##");
					       log.debug("updateSO","i_itemsplit*************"+i_itemsplit);
						   
						   var so_Id=i_itemsplit[0];
						   log.debug("updateSO","so_Id*************"+so_Id);
						   
						   var s_soItem=i_itemsplit[1];
						   //log.debug("updateSO","s_soItem*************"+s_soItem);
						   
						   var s_qty=i_itemsplit[5];
						   //log.debug("updateSO","s_qty*************"+s_qty);
						   
						   var s_location=i_itemsplit[3];
						  // log.debug("updateSO","s_location*************"+s_location);
						   
						   var s_addlineflag=i_itemsplit[4];
						  // log.debug("updateSO","s_addlineflag*************"+s_addlineflag);
						   
						   var i_originalqty=i_itemsplit[2];
						   log.debug("updateSO","i_originalqty*************"+i_originalqty);
						  
						    
						   if(q==0)
						   {
							o_SO_Record = record.load({type: record.Type.SALES_ORDER, id: so_Id,isDynamic: true});
							log.debug("updateSO","q==0*************"+o_SO_Record);
						   }
						   
						   var i_lineCount = o_SO_Record.getLineCount({sublistId: 'item'});
					       log.debug('afterSubmit','i_lineCount :'+i_lineCount);
					 
						for(var p=0;p<i_lineCount;p++)//
						{
							var i_itemID = o_SO_Record.getSublistValue({sublistId: 'item',fieldId: 'item',line: p});
							log.debug('afterSubmit','i_itemID :'+i_itemID);
							
							var i_lineID=o_SO_Record.getSublistValue({sublistId: 'item',fieldId: 'line',line: p});
							log.debug('afterSubmit','i_lineID ******************:'+i_lineID);
							log.debug("updateSO","q*************"+q);
							log.debug('afterSubmit','p ******************:'+p);
							
							log.debug('afterSubmit','s_location$$$$$$ :'+s_location);
							log.debug('afterSubmit','s_soItem$$$$$$ :'+s_soItem);
							
							var i_assignedloc=o_SO_Record.getSublistValue({sublistId: 'item',fieldId: 'location',line: p});
							log.debug('afterSubmit','i_assignedloc ******************:'+i_assignedloc);
							
							//if(i_assignedloc=="")
							//{
								if(s_soItem==i_itemID && s_addlineflag=="modify" && i_lineID!="")
								{
									o_SO_Record.selectLine({"sublistId": "item", "line": p});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "location", "value": s_location});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "quantity", "value": s_qty});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "custcol_rh_auto_location", "value": true});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "custcol_rh_original_qty", "value": i_originalqty});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "custcol_rh_split_line", "value":false});
									o_SO_Record.commitLine({"sublistId": "item"});
									i_locationarr.push(s_location)
								 //   i_checkqty=parseInt(i_checkqty)+parseInt(s_qty)
								
									//log.debug('modify line','i_checkqty=='+i_checkqty);
									log.debug('modify line','line commited');
								}
								else if(s_soItem==i_itemID && s_addlineflag=="add")
								{
									var i_rate=o_SO_Record.getSublistValue({sublistId: 'item',fieldId: 'rate',line: p});
									log.debug('in line','i_rate=='+i_rate);
									
									var i_amount=i_rate*s_qty
									log.debug('in line','i_amount=='+i_amount);								
									
									log.debug('in line','line started');
									o_SO_Record.selectNewLine({sublistId: 'item'});
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "item", "value": s_soItem});
									log.debug('in line','line item selected')							
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "location", "value": s_location});
									log.debug('in line','line s_location')
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "custcol_rh_auto_location", "value": true});
									log.debug('in line','line custcol_rh_auto_location')
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "quantity", "value": s_qty});
									log.debug('in line','line s_qty')
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "amount", "value": i_amount});
									log.debug('in line','line amount')
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "rate", "value":i_rate});
									log.debug('in line','line amount')
									o_SO_Record.setCurrentSublistValue({"sublistId": "item", "fieldId": "custcol_rh_split_line", "value":true});
									o_SO_Record.commitLine({sublistId: "item"});
									// i_checkqty=parseInt(i_checkqty)+parseInt(s_qty)
									i_locationarr.push(s_location)
									log.debug('modify line','i_checkqty=='+i_checkqty);
									log.debug('add line','line added');
								
								}
							//}
							
						}
						log.debug('add line','i_checkqty==i_originalqty');
						log.debug('add line','i_SOqty=='+i_SOqty);
						log.debug('add line','i_checkqty=='+i_checkqty);
						//i_SOqty=parseInt(i_SOqty)+parseInt(i_originalqty)
						
					  }
					 
					
				 }
				
				 if(o_SO_Record!="")
				 {
					  var saved_SO_Id = o_SO_Record.save({enableSourcing: true, ignoreMandatoryFields: true});
					  log.debug('afterSubmit','saved_SO_Id :'+saved_SO_Id);	
					  if(saved_SO_Id!="")
					  {
					 var fieldLookUp = search.lookupFields({
                     type: search.Type.SALES_ORDER,
					 id: saved_SO_Id,
					 columns: ['custbody_rh_location_assignment','statusRef']
						});
					
					var i_arrloc=fieldLookUp.custbody_rh_location_assignment
					log.debug('add line','i_arrloc=='+i_arrloc);
					
					var i_status=fieldLookUp.statusRef
					log.debug('add line','i_status=='+i_status);
					
					if(i_arrloc==true)
					{
						// log.debug('add line',"i_locationarr=="+i_locationarr);
						 i_locationarr=removeDuplicates(i_locationarr)
						  log.debug('add line',"i_locationarr=="+i_locationarr);
						 
						 if(i_locationarr.length>0)
						 {
							 
							for(var a=0;a<i_locationarr.length;a++)
							{
								 var i_location=i_locationarr[a];
								 log.debug('afterSubmit','i_location :'+i_location);
								 
								var objRecord = record.transform({
								 fromType: record.Type.SALES_ORDER,
								 fromId: saved_SO_Id,
								 toType: record.Type.ITEM_FULFILLMENT,
								 isDynamic: true
								});
										
								var lineCount = objRecord.getLineCount({sublistId: 'item'});
								log.debug('afterSubmit','lineCount :'+lineCount);
								
								
								for(var p=0;p<lineCount;p++)
								{
								   var i_SOlocation=objRecord.getSublistValue({sublistId: 'item',fieldId: 'location',line: p});
							       log.debug('afterSubmit','i_SOlocation=='+i_SOlocation);
								   
									if(i_SOlocation==i_location)
									{
										
										objRecord.selectLine({"sublistId": "item", "line": p});
										objRecord.setCurrentSublistValue({"sublistId": "item", "fieldId": "itemreceive", "value": true});
										objRecord.setCurrentSublistValue({"sublistId": "item", "fieldId": "location", "value": i_location});
										objRecord.commitLine({"sublistId": "item"});
										
									}
									  
								}
								
								 var o_INFrec = objRecord.save()
								 log.debug("o_INFrec===== ",o_INFrec);
							 }
							}
						 }
					}
				 }
				var scriptObj = runtime.getCurrentScript();
                log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
			
			}
		}
		catch(e)
			{
				var errString =  'afterSubmit ' + e.name + ' : ' + e.type + ' : ' + e.message;
				log.debug('afterSubmit','errString :'+errString);  
			}
		}
	 
    }
	
function removeDuplicates(num) 
{
	var a_newarray=[];
	var a_itemid=[];
	 var i_split=num.toString().split(',')
	 log.debug("execute","i_split##"+i_split);
 
 for(var k=0;k<i_split.length;k++)
 {
	 var i_dollarsplit=i_split[k].toString().split('##')
	 log.debug("execute","i_dollarsplit##"+i_dollarsplit);
	 if(i_dollarsplit!="" && i_dollarsplit!=undefined && i_dollarsplit!=null)
	 {
	
	 var s_itemid=i_dollarsplit[1];
	 log.debug("execute","s_itemid##"+s_itemid);
	 var s_flag=i_dollarsplit[4];
	 log.debug("execute","s_flag##"+s_flag);
	 
	 // var s_flag=i_dollarsplit[4];
	// log.debug("execute","s_flag##"+s_flag);
	 
	//if(s_flag!="add" && s_flag!="modify" )
	//{
		 if(k==0)
		 {
			
			 a_itemid.push(s_itemid)
			 a_newarray.push(i_dollarsplit[0]+"$$"+i_dollarsplit[1]+"$$"+i_dollarsplit[2]+"$$"+i_dollarsplit[3]+"$$"+i_dollarsplit[4]+"$$"+i_dollarsplit[5])
		 }
		 else
		 {
			 			  
			  var b_itemflag=a_itemid.indexOf(s_itemid);
			  log.debug("IN US","b_itemflag##"+b_itemflag);
			  log.debug("IN US","s_flag##"+s_flag);
			
					if(b_itemflag>-1 && s_flag!="modify")
					 {
						a_newarray.push(i_dollarsplit[0]+"$$"+i_dollarsplit[1]+"$$"+i_dollarsplit[2]+"$$"+i_dollarsplit[3]+"$$"+i_dollarsplit[4]+"$$"+i_dollarsplit[5])
						
						a_itemid.push(s_itemid)
						 log.debug("b_itemflag<-1","b_itemflag<-1##"+a_newarray);
					 }
					 else if(b_itemflag<=-1 && s_flag!="add")
					 {
						 a_newarray.push(i_dollarsplit[0]+"$$"+i_dollarsplit[1]+"$$"+i_dollarsplit[2]+"$$"+i_dollarsplit[3]+"$$"+i_dollarsplit[4]+"$$"+i_dollarsplit[5])
						
						a_itemid.push(s_itemid)
						log.debug("else b_itemflag<-1","b_itemflag<-1##"+a_newarray);
					 }
			
			  
			 
			}
		
	 }
 }
 log.debug("execute","a_newarray##"+a_newarray);
 return a_newarray
 
}

function removeDuplicates(num) {
  var x,
      len=num.length,
      out=[],
      obj={};
 
  for (x=0; x<len; x++) {
    obj[num[x]]=0;
  }
  for (x in obj) {
    out.push(x);
  }
  return out;
}
	
	 function summarize(summary) 
	 {
	    log.debug('Summary Time','Total Seconds: '+summary.output.iterator());
		 
		log.debug('Summary Time','Total Seconds: '+summary.seconds);
    	log.debug('Summary Usage', 'Total Usage: '+summary.usage);
    	log.debug('Summary Yields', 'Total Yields: '+summary.yields);
    	
    	log.debug('Input Summary: ', JSON.stringify(summary.inputSummary));
    	log.debug('Map Summary: ', JSON.stringify(summary.mapSummary));
    	log.debug('Reduce Summary: ', JSON.stringify(summary.reduceSummary));
		
     }
	 	
	function getallInventory(s_ID,s_SOchannel,s_isDTCorder,s_shipCountry)	
	{
		var a_itemarray=[];
		var a_SOitemID=[];
		
		var itemSearchObj = search.create({
		   type: "item",
		   filters:
		   [
			  ["locationquantityavailable","greaterthan","0"], 
			  "AND", 
			  ["transaction.internalid","anyof",s_ID],
			   "AND", 
			  ["inventorylocation.custrecord_pref_channel","anyof",s_SOchannel]
		   ],
		   columns:
		   [
			  search.createColumn({name: "itemid", label: "Name"}),
			  search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal ID"}),
			  search.createColumn({name: "country",join: "inventoryLocation",sort:search.Sort.ASC,label: "Country"}),
			  search.createColumn({name: "locationquantityavailable",sort: search.Sort.DESC,label: "Location Available"}),
			  search.createColumn({name: "custrecord_pref_channel",join: "inventoryLocation",label: "Preferred Channel"}),
			  search.createColumn({name: "name",join: "inventoryLocation",sort: search.Sort.ASC,label: "Name"}),			  
			  search.createColumn({name: "locationaveragecost", label: "Location Average Cost"}),
			  search.createColumn({name: "quantity",join: "transaction",label: "Quantity"}),
			  search.createColumn({name: "formulatext_1",formula: "{transaction.quantity}*{locationaveragecost}",label: "Formula (Text)"}),
			  search.createColumn({name: "internalid",join: "inventoryLocation",label: "Location ID"}),
			  search.createColumn({name: "formulatext_2",formula: "CASE WHEN {locationquantityavailable} >= {transaction.quantity} THEN 'In Stock' ELSE 'Out of Stock' END",label: "Formula (Text)"}),
			  
		   ]
		});
		var searchResultCount = itemSearchObj.runPaged().count;
		log.debug("itemSearchObj result count",searchResultCount);
		var searchResult = itemSearchObj.run().getRange({
		start: 0,
		end: 1000
		});
		for (var i = 0; i < searchResult.length; i++) 
		{
			var s_locname =  searchResult[i].getValue({name: 'country',join:"inventoryLocation"});
			//log.debug("s_locname",s_locname);
			
			var s_itemId=searchResult[i].getValue({name: 'internalid'});
			log.debug("s_itemId",s_itemId);
			
			
			var s_SOqty =  searchResult[i].getValue({name: 'quantity',join:"transaction"});
			log.debug("s_SOqty",s_SOqty);
			
			var s_availbleqty =  searchResult[i].getValue({name: 'locationquantityavailable'});
			log.debug("s_availbleqty",s_availbleqty);
			
			var s_inventoryloc=searchResult[i].getValue({name: 'name',join:"inventoryLocation"});
			//log.debug("s_locname",s_locname);
			
			var s_coutry=searchResult[i].getValue({name: 'country',join:"inventoryLocation"});
			log.debug("s_coutry",s_coutry);
			
			
			var s_averagecost=searchResult[i].getValue({name: 'formulatext_1'});
			//log.debug("s_averagecost",s_averagecost);
			
			var s_instock=searchResult[i].getValue({name: 'formulatext_2'});
			log.debug("s_instock",s_instock);
		    log.debug("a_SOitemID",a_SOitemID);
			var i_locationid=searchResult[i].getValue({name: 'internalid',join: "inventoryLocation"});
			//log.debug("i_locationid",i_locationid);
			 var b_itemflag="";
			 if(s_shipCountry!="US")
			 {
				if(a_SOitemID.length>0)
				{
				  b_itemflag=a_SOitemID.indexOf(s_itemId);
				  log.debug("IN US","b_itemflag##"+b_itemflag);
				}
				  
				if(i==0)
				{
				a_itemarray.push(s_itemId+"$$"+s_SOqty+"$$"+s_inventoryloc+"$$"+s_coutry+"$$"+s_averagecost+"$$"+s_availbleqty+"$$"+i_locationid+"$$"+s_instock)
				a_SOitemID.push(s_itemId)
				}
				else if(b_itemflag<=-1 && s_instock!="Out of Stock")
				{
					a_itemarray.push(s_itemId+"$$"+s_SOqty+"$$"+s_inventoryloc+"$$"+s_coutry+"$$"+s_averagecost+"$$"+s_availbleqty+"$$"+i_locationid+"$$"+s_instock)
					a_SOitemID.push(s_itemId)
				}
				if(i!=0&&s_instock=="Out of Stock")
				{
					a_itemarray.push(s_itemId+"$$"+s_SOqty+"$$"+s_inventoryloc+"$$"+s_coutry+"$$"+s_averagecost+"$$"+s_availbleqty+"$$"+i_locationid+"$$"+s_instock)
					a_SOitemID.push(s_itemId)
				}
			 }
			 else
			 {
				 a_itemarray.push(s_itemId+"$$"+s_SOqty+"$$"+s_inventoryloc+"$$"+s_coutry+"$$"+s_averagecost+"$$"+s_availbleqty+"$$"+i_locationid+"$$"+s_instock)
			 }

		}
		log.debug("a_itemarray",a_itemarray.reverse());
		return a_itemarray.reverse();
	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        
    };
    
});