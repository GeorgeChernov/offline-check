/* PowerPoint specific API library */
/* Version: 15.0.5365.3001 */
/*
	Copyright (c) Microsoft Corporation.  All rights reserved.
*/

/*
	Your use of this file is governed by the Microsoft Services Agreement http://go.microsoft.com/fwlink/?LinkId=266419.
*/

OSF.ClientMode={
	ReadWrite: 0,
	ReadOnly: 1
}
OSF.DDA.RichInitializationReason={
	1: Microsoft.Office.WebExtension.InitializationReason.Inserted,
	2: Microsoft.Office.WebExtension.InitializationReason.DocumentOpened
};
Microsoft.Office.WebExtension.FileType={
	Text: "text",
	Compressed: "compressed"
};
OSF.DDA.RichClientSettingsManager={
	read: function OSF_DDA_RichClientSettingsManager$Read(onCalling, onReceiving) {
		var keys=[];
		var values=[];
		if (onCalling) {
			onCalling();
		}
		if (typeof OsfOMToken !='undefined' && OsfOMToken) {
			window.external.GetContext().GetSettings(OsfOMToken).Read(keys, values);
		}
		else
		{
			window.external.GetContext().GetSettings().Read(keys, values);
		}
		if (onReceiving) {
			onReceiving();
		}
		var serializedSettings={};
		for (var index=0; index < keys.length; index++) {
			serializedSettings[keys[index]]=values[index];
		}
		return serializedSettings;
	},
	write: function OSF_DDA_RichClientSettingsManager$Write(serializedSettings, overwriteIfStale, onCalling, onReceiving) {
		var keys=[];
		var values=[];
		for (var key in serializedSettings) {
			keys.push(key);
			values.push(serializedSettings[key]);
		}
		if (onCalling) {
			onCalling();
		}
		if (typeof OsfOMToken !='undefined' && OsfOMToken) {
			window.external.GetContext().GetSettings(OsfOMToken).Write(keys, values);
		}
		else {
			window.external.GetContext().GetSettings().Write(keys, values);
		}
		if (onReceiving) {
			onReceiving();
		}
	}
};
OSF.DDA.DispIdHost.getRichClientDelegateMethods=function (actionId) {
	var delegateMethods={};
	delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=OSF.DDA.SafeArray.Delegate.executeAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.RegisterEventAsync]=OSF.DDA.SafeArray.Delegate.registerEventAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.UnregisterEventAsync]=OSF.DDA.SafeArray.Delegate.unregisterEventAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.MessageParent]=OSF.DDA.SafeArray.Delegate.MessageParent;
	function getSettingsExecuteMethod(hostDelegateMethod) {
		return function (args) {
			var status, response;
			try {
				response=hostDelegateMethod(args.hostCallArgs, args.onCalling, args.onReceiving);
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeSuccess;
			} catch (ex) {
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeInternalError;
				response={ name : Strings.OfficeOM.L_InternalError, message : ex };
			}
			if (args.onComplete) {
				args.onComplete(status, response);
			}
		};
	}
	function readSerializedSettings(hostCallArgs, onCalling, onReceiving) {
		return OSF.DDA.RichClientSettingsManager.read(onCalling, onReceiving);
	}
	function writeSerializedSettings(hostCallArgs, onCalling, onReceiving) {
		return OSF.DDA.RichClientSettingsManager.write(
			hostCallArgs[OSF.DDA.SettingsManager.SerializedSettings],
			hostCallArgs[Microsoft.Office.WebExtension.Parameters.OverwriteIfStale],
			onCalling,
			onReceiving
		);
	}
	switch (actionId) {
		case OSF.DDA.AsyncMethodNames.RefreshAsync.id:
			delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=getSettingsExecuteMethod(readSerializedSettings);
			break;
		case OSF.DDA.AsyncMethodNames.SaveAsync.id:
			delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=getSettingsExecuteMethod(writeSerializedSettings);
			break;
		default:
			break;
	}
	return delegateMethods;
}
OSF.DDA.DispIdHost.getClientDelegateMethods=function (actionId) {
	var delegateMethods={};
	delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=OSF.DDA.SafeArray.Delegate.executeAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.RegisterEventAsync]=OSF.DDA.SafeArray.Delegate.registerEventAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.UnregisterEventAsync]=OSF.DDA.SafeArray.Delegate.unregisterEventAsync;
	delegateMethods[OSF.DDA.DispIdHost.Delegates.MessageParent]=OSF.DDA.SafeArray.Delegate.MessageParent;
	if (OSF.DDA.AsyncMethodNames.RefreshAsync && actionId==OSF.DDA.AsyncMethodNames.RefreshAsync.id) {
		var readSerializedSettings=function (hostCallArgs, onCalling, onReceiving) {
			return OSF.DDA.ClientSettingsManager.read(onCalling, onReceiving);
		};
		delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=OSF.DDA.ClientSettingsManager.getSettingsExecuteMethod(readSerializedSettings);
	}
	if (OSF.DDA.AsyncMethodNames.SaveAsync && actionId==OSF.DDA.AsyncMethodNames.SaveAsync.id) {
		var writeSerializedSettings=function (hostCallArgs, onCalling, onReceiving) {
			return OSF.DDA.ClientSettingsManager.write(hostCallArgs[OSF.DDA.SettingsManager.SerializedSettings], hostCallArgs[Microsoft.Office.WebExtension.Parameters.OverwriteIfStale], onCalling, onReceiving);
		};
		delegateMethods[OSF.DDA.DispIdHost.Delegates.ExecuteAsync]=OSF.DDA.ClientSettingsManager.getSettingsExecuteMethod(writeSerializedSettings);
	}
	return delegateMethods;
}
OSF.DDA.File=function OSF_DDA_File(handle, fileSize, sliceSize) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"size": {
			value: fileSize
		},
		"sliceCount": {
			value: Math.ceil(fileSize / sliceSize)
		}
	});
	var privateState={};
	privateState[OSF.DDA.FileProperties.Handle]=handle;
	privateState[OSF.DDA.FileProperties.SliceSize]=sliceSize;
	var am=OSF.DDA.AsyncMethodNames;
	OSF.DDA.DispIdHost.addAsyncMethods(
		this, [
			am.GetDocumentCopyChunkAsync,
			am.ReleaseDocumentCopyAsync
		],
		privateState
	);
}
OSF.DDA.FileSliceOffset="fileSliceoffset";
OSF.DDA.CustomXmlParts=function OSF_DDA_CustomXmlParts() {
	this._eventDispatches=[];
	var am=OSF.DDA.AsyncMethodNames;
	OSF.DDA.DispIdHost.addAsyncMethods(this, [
		am.AddDataPartAsync,
		am.GetDataPartByIdAsync,
		am.GetDataPartsByNameSpaceAsync
	]);
};
OSF.DDA.CustomXmlPart=function OSF_DDA_CustomXmlPart(customXmlParts, id, builtIn) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"builtIn": {
			value: builtIn
		},
		"id": {
			value: id
		},
		"namespaceManager": {
			value: new OSF.DDA.CustomXmlPrefixMappings(id)
		}
	});
	var am=OSF.DDA.AsyncMethodNames;
	OSF.DDA.DispIdHost.addAsyncMethods(this, [
		am.DeleteDataPartAsync,
		am.GetPartNodesAsync,
		am.GetPartXmlAsync
	]);
	var customXmlPartEventDispatches=customXmlParts._eventDispatches;
	var dispatch=customXmlPartEventDispatches[id];
	if (!dispatch) {
		var et=Microsoft.Office.WebExtension.EventType;
		dispatch=new OSF.EventDispatch([
			et.DataNodeDeleted,
			et.DataNodeInserted,
			et.DataNodeReplaced
		]);
		customXmlPartEventDispatches[id]=dispatch;
	}
	OSF.DDA.DispIdHost.addEventSupport(this, dispatch);
};
OSF.DDA.CustomXmlPrefixMappings=function OSF_DDA_CustomXmlPrefixMappings(partId) {
	var am=OSF.DDA.AsyncMethodNames;
	OSF.DDA.DispIdHost.addAsyncMethods(
		this,
		[
			am.AddDataPartNamespaceAsync,
			am.GetDataPartNamespaceAsync,
			am.GetDataPartPrefixAsync
		],
		partId
	);
};
OSF.DDA.CustomXmlNode=function OSF_DDA_CustomXmlNode(handle, nodeType, ns, baseName) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"baseName": {
			value: baseName
		},
		"namespaceUri": {
			value: ns
		},
		"nodeType": {
			value: nodeType
		}
	});
	var am=OSF.DDA.AsyncMethodNames;
	OSF.DDA.DispIdHost.addAsyncMethods(
		this,
		[
			am.GetRelativeNodesAsync,
			am.GetNodeValueAsync,
			am.GetNodeXmlAsync,
			am.SetNodeValueAsync,
			am.SetNodeXmlAsync,
			am.GetNodeTextAsync,
			am.SetNodeTextAsync
		],
		handle
	);
};
OSF.DDA.NodeInsertedEventArgs=function OSF_DDA_NodeInsertedEventArgs(newNode, inUndoRedo) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"type": {
			value: Microsoft.Office.WebExtension.EventType.DataNodeInserted
		},
		"newNode": {
			value: newNode
		},
		"inUndoRedo": {
			value: inUndoRedo
		}
	});
};
OSF.DDA.NodeReplacedEventArgs=function OSF_DDA_NodeReplacedEventArgs(oldNode, newNode, inUndoRedo) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"type": {
			value: Microsoft.Office.WebExtension.EventType.DataNodeReplaced
		},
		"oldNode": {
			value: oldNode
		},
		"newNode": {
			value: newNode
		},
		"inUndoRedo": {
			value: inUndoRedo
		}
	});
};
OSF.DDA.NodeDeletedEventArgs=function OSF_DDA_NodeDeletedEventArgs(oldNode, oldNextSibling, inUndoRedo) {
	OSF.OUtil.defineEnumerableProperties(this, {
		"type": {
			value: Microsoft.Office.WebExtension.EventType.DataNodeDeleted
		},
		"oldNode": {
			value: oldNode
		},
		"oldNextSibling": {
			value: oldNextSibling
		},
		"inUndoRedo": {
			value: inUndoRedo
		}
	});
};
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.FileType, {
	Compressed: "compressed",
	Pdf: "pdf"
});
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.CoercionType, {
	Text: "text",
	SlideRange: "slideRange",
	Image: "image"
});
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.EventType, {
	DocumentSelectionChanged: "documentSelectionChanged",
	OfficeThemeChanged: "officeThemeChanged",
	DocumentThemeChanged: "documentThemeChanged",
	ActiveViewChanged: "activeViewChanged",
	DialogMessageReceived: "dialogMessageReceived",
	DialogEventReceived: "dialogEventReceived"
});
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.ValueFormat, {
	Unformatted: "unformatted"
});
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.FilterType, {
	All: "all"
});
Microsoft.Office.Internal.OfficeTheme={
	PrimaryFontColor: "primaryFontColor",
	PrimaryBackgroundColor: "primaryBackgroundColor",
	SecondaryFontColor: "secondaryFontColor",
	SecondaryBackgroundColor: "secondaryBackgroundColor"
};
Microsoft.Office.Internal.DocumentTheme={
	PrimaryFontColor:"primaryFontColor",
	PrimaryBackgroundColor: "primaryBackgroundColor",
	SecondaryFontColor: "secondaryFontColor",
	SecondaryBackgroundColor: "secondaryBackgroundColor",
	Accent1: "accent1",
	Accent2: "accent2",
	Accent3: "accent3",
	Accent4: "accent4",
	Accent5: "accent5",
	Accent6: "accent6",
	Hyperlink: "hyperlink",
	FollowedHyperlink: "followedHyperlink",
	HeaderLatinFont: "headerLatinFont",
	HeaderEastAsianFont: "headerEastAsianFont",
	HeaderScriptFont: "headerScriptFont",
	HeaderLocalizedFont: "headerLocalizedFont",
	BodyLatinFont: "bodyLatinFont",
	BodyEastAsianFont: "bodyEastAsianFont",
	BodyScriptFont: "bodyScriptFont",
	BodyLocalizedFont: "bodyLocalizedFont"
};
Microsoft.Office.WebExtension.ActiveView={};
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.ActiveView, {
	Read: "read",
	Edit: "edit"
});
OSF.OUtil.redefineList(Microsoft.Office.WebExtension.GoToType, {
	Slide: "slide",
	Index: "index"
});
delete Microsoft.Office.WebExtension.BindingType;
delete Microsoft.Office.WebExtension.select;
OSF.OUtil.setNamespace("SafeArray", OSF.DDA);
OSF.DDA.SafeArray.Response={
	Status: 0,
	Payload: 1
};
OSF.DDA.SafeArray.UniqueArguments={
	Offset: "offset",
	Run: "run",
	BindingSpecificData: "bindingSpecificData",
	MergedCellGuid: "{66e7831f-81b2-42e2-823c-89e872d541b3}"
};
OSF.OUtil.setNamespace("Delegate", OSF.DDA.SafeArray);
OSF.DDA.SafeArray.Delegate.SpecialProcessor=function OSF_DDA_SafeArray_Delegate_SpecialProcessor() {
	function _2DVBArrayToJaggedArray(vbArr) {
		var ret;
		try {
			var rows=vbArr.ubound(1);
			var cols=vbArr.ubound(2);
			vbArr=vbArr.toArray();
			if (rows==1 && cols==1) {
				ret=[vbArr];
			} else {
				ret=[];
				for (var row=0; row < rows; row++) {
					var rowArr=[];
					for (var col=0; col < cols; col++) {
						var datum=vbArr[row * cols+col];
						if (datum !=OSF.DDA.SafeArray.UniqueArguments.MergedCellGuid) {
							rowArr.push(datum);
						}
					}
					if (rowArr.length > 0) {
						ret.push(rowArr);
					}
				}
			}
		} catch (ex) {
		}
		return ret;
	}
	var complexTypes=[
		OSF.DDA.PropertyDescriptors.FileProperties,
		OSF.DDA.PropertyDescriptors.FileSliceProperties,
		OSF.DDA.PropertyDescriptors.FilePropertiesDescriptor,
		OSF.DDA.PropertyDescriptors.BindingProperties,
		OSF.DDA.SafeArray.UniqueArguments.BindingSpecificData,
		OSF.DDA.SafeArray.UniqueArguments.Offset,
		OSF.DDA.SafeArray.UniqueArguments.Run,
		OSF.DDA.PropertyDescriptors.Subset,
		OSF.DDA.PropertyDescriptors.DataPartProperties,
		OSF.DDA.PropertyDescriptors.DataNodeProperties,
		OSF.DDA.EventDescriptors.BindingSelectionChangedEvent,
		OSF.DDA.EventDescriptors.DataNodeInsertedEvent,
		OSF.DDA.EventDescriptors.DataNodeReplacedEvent,
		OSF.DDA.EventDescriptors.DataNodeDeletedEvent,
		OSF.DDA.EventDescriptors.DocumentThemeChangedEvent,
		OSF.DDA.EventDescriptors.OfficeThemeChangedEvent,
		OSF.DDA.EventDescriptors.ActiveViewChangedEvent,
		OSF.DDA.EventDescriptors.AppCommandInvokedEvent,
		OSF.DDA.DataNodeEventProperties.OldNode,
		OSF.DDA.DataNodeEventProperties.NewNode,
		OSF.DDA.DataNodeEventProperties.NextSiblingNode,
		Microsoft.Office.Internal.Parameters.OfficeTheme,
		Microsoft.Office.Internal.Parameters.DocumentTheme
	];
	var dynamicTypes={};
	dynamicTypes[Microsoft.Office.WebExtension.Parameters.Data]=(function () {
		var tableRows=0;
		var tableHeaders=1;
		return {
			toHost: function OSF_DDA_SafeArray_Delegate_SpecialProcessor_Data$toHost(data) {
				if (typeof data !="string" && data[OSF.DDA.TableDataProperties.TableRows] !==undefined) {
					var tableData=[];
					tableData[tableRows]=data[OSF.DDA.TableDataProperties.TableRows];
					tableData[tableHeaders]=data[OSF.DDA.TableDataProperties.TableHeaders];
					data=tableData;
				}
				return data;
			},
			fromHost: function OSF_DDA_SafeArray_Delegate_SpecialProcessor_Data$fromHost(hostArgs) {
				var ret;
				if (hostArgs.toArray) {
					var dimensions=hostArgs.dimensions();
					if(dimensions===2) {
						ret=_2DVBArrayToJaggedArray(hostArgs);
					} else {
						var array=hostArgs.toArray();
						if(array.length===2 &&  ((array[0] !=null && array[0].toArray) || (array[1] !=null && array[1].toArray))) {
							ret={};
							ret[OSF.DDA.TableDataProperties.TableRows]=_2DVBArrayToJaggedArray(array[tableRows]);
							ret[OSF.DDA.TableDataProperties.TableHeaders]=_2DVBArrayToJaggedArray(array[tableHeaders]);
						} else {
							ret=array;
						}
					}
				} else {
					ret=hostArgs;
				}
				return ret;
			}
		}
	})();
	OSF.DDA.SafeArray.Delegate.SpecialProcessor.uber.constructor.call(this, complexTypes, dynamicTypes);
	this.pack=function OSF_DDA_SafeArray_Delegate_SpecialProcessor$pack(param, arg) {
		var value;
		if (this.isDynamicType(param)) {
			value=dynamicTypes[param].toHost(arg);
		} else {
			value=arg;
		}
		return value;
	};
	this.unpack=function OSF_DDA_SafeArray_Delegate_SpecialProcessor$unpack(param, arg) {
		var value;
		if (this.isComplexType(param) || OSF.DDA.ListType.isListType(param)) {
			try {
				value=arg.toArray();
			} catch (ex) {
				value=arg || {};
			}
		} else if (this.isDynamicType(param)) {
			value=dynamicTypes[param].fromHost(arg);
		} else {
			value=arg;
		}
		return value;
	};
	this.dynamicTypes=dynamicTypes;
}
OSF.OUtil.extend(OSF.DDA.SafeArray.Delegate.SpecialProcessor, OSF.DDA.SpecialProcessor);
OSF.DDA.SafeArray.Delegate.ParameterMap=(function () {
	var parameterMap=new OSF.DDA.HostParameterMap(new OSF.DDA.SafeArray.Delegate.SpecialProcessor());
	var ns;
	var self=parameterMap.self;
	function createObject(properties) {
		var obj=null;
		if (properties) {
			obj={};
			var len=properties.length;
			for (var i=0; i < len; i++) {
				obj[properties[i].name]=properties[i].value;
			}
		}
		return obj;
	}
	function define(definition) {
		var args={};
		var toHost=createObject(definition.toHost);
		if (definition.invertible) {
			args.map=toHost;
		}
		else if (definition.canonical) {
			args.toHost=args.fromHost=toHost;
		}
		else {
			args.toHost=toHost;
			args.fromHost=createObject(definition.fromHost);
		}
		parameterMap.setMapping(definition.type, args);
	}
	ns=OSF.DDA.FileProperties;
	define({
		type: OSF.DDA.PropertyDescriptors.FileProperties,
		fromHost: [
			{ name: ns.Handle, value: 0 },
			{ name: ns.FileSize, value: 1 }
		]
	});
	define({
		type: OSF.DDA.PropertyDescriptors.FileSliceProperties,
		fromHost: [
			{ name: Microsoft.Office.WebExtension.Parameters.Data, value: 0 },
			{ name: ns.SliceSize, value: 1}
		]
	});
	ns=OSF.DDA.FilePropertiesDescriptor;
	define({
		type: OSF.DDA.PropertyDescriptors.FilePropertiesDescriptor,
		fromHost: [
			{ name: ns.Url, value: 0 }
		]
	});
	ns=OSF.DDA.BindingProperties;
	define({
		type: OSF.DDA.PropertyDescriptors.BindingProperties,
		fromHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.Type, value: 1 },
			{ name: OSF.DDA.SafeArray.UniqueArguments.BindingSpecificData, value: 2 }
		]
	});
	define({
		type: OSF.DDA.SafeArray.UniqueArguments.BindingSpecificData,
		fromHost: [
			{ name: ns.RowCount, value: 0 },
			{ name: ns.ColumnCount, value: 1 },
			{ name: ns.HasHeaders, value: 2 }
		]
	});
	ns=OSF.DDA.SafeArray.UniqueArguments;
	define({
		type: OSF.DDA.PropertyDescriptors.Subset,
		toHost: [
			{ name: ns.Offset, value: 0 },
			{ name: ns.Run, value: 1 }
		],
		canonical: true
	});
	ns=Microsoft.Office.WebExtension.Parameters;
	define({
		type: OSF.DDA.SafeArray.UniqueArguments.Offset,
		toHost: [
			{ name: ns.StartRow, value: 0 },
			{ name: ns.StartColumn, value: 1 }
		],
		canonical: true
	});
	define({
		type: OSF.DDA.SafeArray.UniqueArguments.Run,
		toHost: [
			{ name: ns.RowCount, value: 0 },
			{ name: ns.ColumnCount, value: 1 }
		],
		canonical: true
	});
	ns=OSF.DDA.DataPartProperties;
	define({
		type: OSF.DDA.PropertyDescriptors.DataPartProperties,
		fromHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.BuiltIn, value: 1 }
		]
	});
	ns=OSF.DDA.DataNodeProperties;
	define({
		type: OSF.DDA.PropertyDescriptors.DataNodeProperties,
		fromHost: [
			{ name: ns.Handle, value: 0 },
			{ name: ns.BaseName, value: 1 },
			{ name: ns.NamespaceUri, value: 2 },
			{ name: ns.NodeType, value: 3 }
		]
	});
	define({
		type: OSF.DDA.EventDescriptors.BindingSelectionChangedEvent,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: 0 },
			{ name: OSF.DDA.PropertyDescriptors.Subset, value: 1 }
		]
	});
	define({
		type: OSF.DDA.EventDescriptors.DocumentThemeChangedEvent,
		fromHost: [
			{ name: Microsoft.Office.Internal.Parameters.DocumentTheme, value: self}
		]
	})
	define({
		type: OSF.DDA.EventDescriptors.OfficeThemeChangedEvent,
		fromHost: [
			{ name: Microsoft.Office.Internal.Parameters.OfficeTheme, value: self}
		]
	})
	define({
		type: OSF.DDA.EventDescriptors.ActiveViewChangedEvent,
		fromHost: [
			{ name: Microsoft.Office.WebExtension.Parameters.ActiveView, value: 0}
		]
	})
	ns=OSF.DDA.DataNodeEventProperties;
	define({
		type: OSF.DDA.EventDescriptors.DataNodeInsertedEvent,
		fromHost: [
			{ name: ns.InUndoRedo, value: 0 },
			{ name: ns.NewNode, value: 1 }
		]
	});
	define({
		type: OSF.DDA.EventDescriptors.DataNodeReplacedEvent,
		fromHost: [
			{ name: ns.InUndoRedo, value: 0 },
			{ name: ns.OldNode, value: 1 },
			{ name: ns.NewNode, value: 2 }
		]
	});
	define({
		type: OSF.DDA.EventDescriptors.DataNodeDeletedEvent,
		fromHost: [
			{ name: ns.InUndoRedo, value: 0 },
			{ name: ns.OldNode, value: 1 },
			{ name: ns.NextSiblingNode, value: 2 }
		]
	});
	define({
		type: ns.OldNode,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.DataNodeProperties, value: self }
		]
	});
	define({
		type: ns.NewNode,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.DataNodeProperties, value: self }
		]
	});
	define({
		type: ns.NextSiblingNode,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.DataNodeProperties, value: self }
		]
	});
	ns=Microsoft.Office.WebExtension.AsyncResultStatus;
	define({
		type: OSF.DDA.PropertyDescriptors.AsyncResultStatus,
		fromHost: [
			{ name: ns.Succeeded, value: 0 },
			{ name: ns.Failed, value: 1 }
		]
	});
	ns=Microsoft.Office.WebExtension.CoercionType;
	define({
		type: Microsoft.Office.WebExtension.Parameters.CoercionType,
		toHost: [
			{ name: ns.Text, value: 0 },
			{ name: ns.Matrix, value: 1 },
			{ name: ns.Table, value: 2 },
			{ name: ns.Html, value: 3 },
			{ name: ns.Ooxml, value: 4 },
			{ name: ns.SlideRange, value:7 },
			{ name: ns.Image, value:8 }
		]
	});
	ns=Microsoft.Office.WebExtension.GoToType;
	define({
		type: Microsoft.Office.WebExtension.Parameters.GoToType,
		toHost: [
			{ name: ns.Binding, value: 0 },
			{ name: ns.NamedItem, value: 1 },
			{ name: ns.Slide, value: 2 },
			{ name: ns.Index, value: 3 }
		]
	});
	ns=Microsoft.Office.WebExtension.FileType;
	if (ns) {
		define({
			type: Microsoft.Office.WebExtension.Parameters.FileType,
			toHost: [
			{ name: ns.Text, value: 0 },
			{ name: ns.Compressed, value: 5 },
			{ name: ns.Pdf, value: 6 }
		]
		});
	}
	ns=Microsoft.Office.WebExtension.BindingType;
	if (ns) {
		define({
			type: Microsoft.Office.WebExtension.Parameters.BindingType,
			toHost: [
				{ name: ns.Text, value: 0 },
				{ name: ns.Matrix, value: 1 },
				{ name: ns.Table, value: 2 }
			],
			invertible: true
		});
	}
	ns=Microsoft.Office.WebExtension.ValueFormat;
	define({
		type: Microsoft.Office.WebExtension.Parameters.ValueFormat,
		toHost: [
			{ name: ns.Unformatted, value: 0 },
			{ name: ns.Formatted, value: 1 }
		]
	});
	ns=Microsoft.Office.WebExtension.FilterType;
	define({
		type: Microsoft.Office.WebExtension.Parameters.FilterType,
		toHost: [
			{ name: ns.All, value: 0 },
			{ name: ns.OnlyVisible, value: 1 }
		]
	});
	ns=Microsoft.Office.Internal.OfficeTheme;
	if (ns) {
		define({
			type:Microsoft.Office.Internal.Parameters.OfficeTheme,
			fromHost: [
						{name: ns.PrimaryFontColor, value: 0},
						{name: ns.PrimaryBackgroundColor, value: 1},
						{name: ns.SecondaryFontColor, value:2},
						{name: ns.SecondaryBackgroundColor, value:3}
			]
		})
	}
	ns=Microsoft.Office.WebExtension.ActiveView;
	if (ns) {
		define({
			type:Microsoft.Office.WebExtension.Parameters.ActiveView,
			fromHost: [
				{name: 0, value: ns.Read},
				{name: 1, value: ns.Edit}
			]
		})
	}
	ns=Microsoft.Office.Internal.DocumentTheme;
	if (ns) {
		define({
			type:Microsoft.Office.Internal.Parameters.DocumentTheme,
			fromHost: [
				{name: ns.PrimaryBackgroundColor, value: 0},
				{name: ns.PrimaryFontColor, value: 1},
				{name: ns.SecondaryBackgroundColor, value: 2},
				{name: ns.SecondaryFontColor, value: 3},
				{name: ns.Accent1, value: 4},
				{name: ns.Accent2, value: 5},
				{name: ns.Accent3, value: 6},
				{name: ns.Accent4, value: 7},
				{name: ns.Accent5, value: 8},
				{name: ns.Accent6, value: 9},
				{name: ns.Hyperlink, value: 10},
				{name: ns.FollowedHyperlink, value: 11},
				{name: ns.HeaderLatinFont, value: 12},
				{name: ns.HeaderEastAsianFont, value: 13},
				{name: ns.HeaderScriptFont, value: 14},
				{name: ns.HeaderLocalizedFont, value: 15},
				{name: ns.BodyLatinFont, value: 16},
				{name: ns.BodyEastAsianFont, value: 17},
				{name: ns.BodyScriptFont, value: 18},
				{name: ns.BodyLocalizedFont, value: 19}
			]
		})
	}
	ns=Microsoft.Office.WebExtension.SelectionMode;
	define({
		type: Microsoft.Office.WebExtension.Parameters.SelectionMode,
		toHost: [
			{ name: ns.Default, value: 0 },
			{ name: ns.Selected, value: 1 },
			{ name: ns.None, value: 2 },
		]
	});
	ns=Microsoft.Office.WebExtension.Parameters;
	var cns=OSF.DDA.MethodDispId;
	define({
		type: cns.dispidNavigateToMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.GoToType, value: 1 },
			{ name: ns.SelectionMode, value: 2 }
		]
	});
	define({
		type: cns.dispidGetSelectedDataMethod,
		fromHost: [
			{ name: ns.Data, value: self }
		],
		toHost: [
			{ name: ns.CoercionType, value: 0 },
			{ name: ns.ValueFormat, value: 1 },
			{ name: ns.FilterType, value: 2 }
		]
	});
	define({
		type: cns.dispidSetSelectedDataMethod,
		toHost: [
			{ name: ns.CoercionType, value: 0 },
			{ name: ns.Data, value: 1 },
			{ name: ns.ImageLeft, value: 2 },
			{ name: ns.ImageTop, value: 3 },
			{ name: ns.ImageWidth, value: 4 },
			{ name: ns.ImageHeight, value: 5 }
		]
	});
	define({
		type: cns.dispidGetFilePropertiesMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.FilePropertiesDescriptor, value: self }
		]
	});
	define({
		type: cns.dispidGetDocumentCopyMethod,
		toHost: [{ name: ns.FileType, value: 0}],
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.FileProperties, value: self }
		]
	});
	define({
		type: cns.dispidGetDocumentCopyChunkMethod,
		toHost: [
			{ name: OSF.DDA.FileProperties.Handle, value: 0 },
			{ name: OSF.DDA.FileSliceOffset, value: 1 },
			{ name: OSF.DDA.FileProperties.SliceSize, value: 2 }
		],
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.FileSliceProperties, value: self }
		]
	});
	define({
		type: cns.dispidReleaseDocumentCopyMethod,
		toHost: [{ name: OSF.DDA.FileProperties.Handle, value: 0}]
	});
	define({
		type: cns.dispidAddBindingFromSelectionMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.BindingType, value: 1 }
		]
	});
	define({
		type: cns.dispidAddBindingFromPromptMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.BindingType, value: 1 },
			{ name: ns.PromptText, value: 2 }
		]
	});
	define({
		type: cns.dispidAddBindingFromNamedItemMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: self }
		],
		toHost: [
			{ name: ns.ItemName, value: 0 },
			{ name: ns.Id, value: 1 },
			{ name: ns.BindingType, value: 2 },
			{ name: ns.FailOnCollision, value: 3 }
		]
	});
	define({
		type: cns.dispidReleaseBindingMethod,
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidGetBindingMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidGetAllBindingsMethod,
		fromHost: [
			{ name: OSF.DDA.ListDescriptors.BindingList, value: self }
		]
	});
	define({
		type: cns.dispidGetBindingDataMethod,
		fromHost: [
			{ name: ns.Data, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.CoercionType, value: 1 },
			{ name: ns.ValueFormat, value: 2 },
			{ name: ns.FilterType, value: 3 },
			{ name: OSF.DDA.PropertyDescriptors.Subset, value: 4 }
		]
	});
	define({
		type: cns.dispidSetBindingDataMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.CoercionType, value: 1 },
			{ name: ns.Data, value: 2 },
			{ name: OSF.DDA.SafeArray.UniqueArguments.Offset, value: 3 }
		]
	});
	define({
		type: cns.dispidAddRowsMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.Data, value: 1 }
		]
	});
	define({
		type: cns.dispidAddColumnsMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.Data, value: 1 }
		]
	});
	define({
		type: cns.dispidClearAllRowsMethod,
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidClearFormatsMethod,
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
		define({
		type: cns.dispidSetTableOptionsMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.TableOptions, value: 1 },
		]
	});
	define({
		type: cns.dispidSetFormatsMethod,
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.CellFormat, value: 1 },
		]
	});
	define({
		type: cns.dispidLoadSettingsMethod,
		fromHost: [
			{ name: OSF.DDA.SettingsManager.SerializedSettings, value: self }
		]
	});
	define({
		type: cns.dispidSaveSettingsMethod,
		toHost: [
			{ name: OSF.DDA.SettingsManager.SerializedSettings, value: OSF.DDA.SettingsManager.SerializedSettings },
			{ name: Microsoft.Office.WebExtension.Parameters.OverwriteIfStale, value: Microsoft.Office.WebExtension.Parameters.OverwriteIfStale }
		]
	});
	define({
		type: OSF.DDA.MethodDispId.dispidGetOfficeThemeMethod,
		fromHost: [
			{ name: Microsoft.Office.Internal.Parameters.OfficeTheme, value: self }
		]
	});
	define({
		type: OSF.DDA.MethodDispId.dispidGetDocumentThemeMethod,
		fromHost: [
			{ name: Microsoft.Office.Internal.Parameters.DocumentTheme, value: self }
		]
	});
	define({
		type: OSF.DDA.MethodDispId.dispidGetActiveViewMethod,
		fromHost: [
			{ name: Microsoft.Office.WebExtension.Parameters.ActiveView, value: self }
		]
	});
	define({
		type: cns.dispidAddDataPartMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.DataPartProperties, value: self }
		],
		toHost: [
			{ name: ns.Xml, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataPartByIdMethod,
		fromHost: [
			{ name: OSF.DDA.PropertyDescriptors.DataPartProperties, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataPartsByNamespaceMethod,
		fromHost: [
			{ name: OSF.DDA.ListDescriptors.DataPartList, value: self }
		],
		toHost: [
			{ name: ns.Namespace, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataPartXmlMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataPartNodesMethod,
		fromHost: [
			{ name: OSF.DDA.ListDescriptors.DataNodeList, value: self }
		],
		toHost: [
			{ name: ns.Id, value: 0 },
			{ name: ns.XPath, value: 1 }
		]
	});
	define({
		type: cns.dispidDeleteDataPartMethod,
		toHost: [
			{ name: ns.Id, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataNodeValueMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataNodeXmlMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 }
		]
	});
	define({
		type: cns.dispidGetDataNodesMethod,
		fromHost: [
			{ name: OSF.DDA.ListDescriptors.DataNodeList, value: self }
		],
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 },
			{ name: ns.XPath, value: 1 }
		]
	});
	define({
		type: cns.dispidSetDataNodeValueMethod,
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 },
			{ name: ns.Data, value: 1 }
		]
	});
	define({
		type: cns.dispidSetDataNodeXmlMethod,
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 },
			{ name: ns.Xml, value: 1 }
		]
	});
	define({
		type: cns.dispidAddDataNamespaceMethod,
		toHost: [
			{ name: OSF.DDA.DataPartProperties.Id, value: 0 },
			{ name: ns.Prefix, value: 1 },
			{ name: ns.Namespace, value: 2 }
		]
	});
	define({
		type: cns.dispidGetDataUriByPrefixMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: OSF.DDA.DataPartProperties.Id, value: 0 },
			{ name: ns.Prefix, value: 1 }
		]
	});
	define({
		type: cns.dispidGetDataPrefixByUriMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: OSF.DDA.DataPartProperties.Id, value: 0 },
			{ name: ns.Namespace, value: 1 }
		]
	});
	define({
		type: cns.dispidGetDataNodeTextMethod,
		fromHost: [
			{ name: ns.Data, value: self}
		],
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 }
		]
	});
	define({
		type: cns.dispidSetDataNodeTextMethod,
		toHost: [
			{ name: OSF.DDA.DataNodeProperties.Handle, value: 0 },
			{ name: ns.Text, value: 1 }
		]
	});
	define({
		type: cns.dispidGetSelectedTaskMethod,
		fromHost: [
			{ name: ns.TaskId, value: self }
		]
	});
	define({
		type: cns.dispidGetTaskMethod,
		fromHost: [
			{ name: "taskName", value: 0 },
			{ name: "wssTaskId", value: 1 },
			{ name: "resourceNames", value: 2 }
		],
		toHost: [
			{ name: ns.TaskId, value: 0 }
		]
	});
	define({
		type: cns.dispidGetTaskFieldMethod,
		fromHost: [
			{ name: ns.FieldValue, value: self }
		],
		toHost: [
			{ name: ns.TaskId, value: 0 },
			{ name: ns.FieldId, value: 1 },
			{ name: ns.GetRawValue, value: 2 }
		]
	});
	define({
		type: cns.dispidGetWSSUrlMethod,
		fromHost: [
			{ name: ns.ServerUrl, value: 0 },
			{ name: ns.ListName, value: 1 }
		]
	});
	define({
		type: cns.dispidGetSelectedResourceMethod,
		fromHost: [
			{ name: ns.ResourceId, value: self }
		]
	});
	define({
		type: cns.dispidGetResourceFieldMethod,
		fromHost: [
			{ name: ns.FieldValue, value: self }
		],
		toHost: [
			{ name: ns.ResourceId, value: 0 },
			{ name: ns.FieldId, value: 1 },
			{ name: ns.GetRawValue, value: 2 }
		]
	});
	define({
		type: cns.dispidGetProjectFieldMethod,
		fromHost: [
			{ name: ns.FieldValue, value: self }
		],
		toHost: [
			{ name: ns.FieldId, value: 0 },
			{ name: ns.GetRawValue, value: 1 }
		]
	});
	define({
		type: cns.dispidGetSelectedViewMethod,
		fromHost: [
			{ name: ns.ViewType, value: 0 },
			{ name: ns.ViewName, value: 1 }
		]
	});
	cns=OSF.DDA.EventDispId
	define({ type: cns.dispidDocumentSelectionChangedEvent });
	define({
		type: cns.dispidBindingSelectionChangedEvent,
		fromHost: [
			{name: OSF.DDA.EventDescriptors.BindingSelectionChangedEvent, value: self}
		]
	});
	define({
		type: cns.dispidBindingDataChangedEvent,
		fromHost: [{ name: OSF.DDA.PropertyDescriptors.BindingProperties, value: self}]
	});
	define({ type: cns.dispidSettingsChangedEvent });
	define({
		type: cns.dispidDocumentThemeChangedEvent,
		fromHost: [
			{name: OSF.DDA.EventDescriptors.DocumentThemeChangedEvent, value: self}
		]
	});
	define({
		type: cns.dispidOfficeThemeChangedEvent,
		fromHost: [
			{name: OSF.DDA.EventDescriptors.OfficeThemeChangedEvent, value: self}
		]
	});
	define({
		type: cns.dispidActiveViewChangedEvent,
		fromHost: [{ name: OSF.DDA.EventDescriptors.ActiveViewChangedEvent, value: self}]
	});
	define({
		type: cns.dispidDataNodeAddedEvent,
		fromHost: [{ name: OSF.DDA.EventDescriptors.DataNodeInsertedEvent, value: self}]
	});
	define({
		type: cns.dispidDataNodeReplacedEvent,
		fromHost: [{ name: OSF.DDA.EventDescriptors.DataNodeReplacedEvent, value: self}]
	});
	define({
		type: cns.dispidDataNodeDeletedEvent,
		fromHost: [{ name: OSF.DDA.EventDescriptors.DataNodeDeletedEvent, value: self}]
	});
	define({ type: cns.dispidTaskSelectionChangedEvent });
	define({ type: cns.dispidResourceSelectionChangedEvent });
	define({ type: cns.dispidViewSelectionChangedEvent });
	parameterMap.define=define;
	return parameterMap;
})();
OSF.DDA.SafeArray.Delegate._onException=function OSF_DDA_SafeArray_Delegate$OnException(ex, args) {
	var status;
	var number=ex.number;
	if (number) {
		switch (number) {
			case -2146828218:
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeNoCapability;
				break;
			case -2146827850:
			default:
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeInternalError;
				break;
		}
	}
	if (args.onComplete) {
		args.onComplete(status || OSF.DDA.ErrorCodeManager.errorCodes.ooeInternalError);
	}
}
OSF.DDA.SafeArray.Delegate.executeAsync=function OSF_DDA_SafeArray_Delegate$ExecuteAsync(args) {
	try {
		if (args.onCalling) {
			args.onCalling();
		}
		function toArray(args) {
			var arrArgs=args;
			if (OSF.OUtil.isArray(args)) {
				var len=arrArgs.length;
				for (var i=0; i < len; i++) {
					arrArgs[i]=toArray(arrArgs[i]);
				}
			} else if (OSF.OUtil.isDate(args)) {
				arrArgs=args.getVarDate();
			} else if (typeof args==="object" && !OSF.OUtil.isArray(args)) {
				arrArgs=[];
				for (var index in args) {
					if (!OSF.OUtil.isFunction(args[index])) {
						arrArgs[index]=toArray(args[index]);
					}
				}
			}
			return arrArgs;
		}
		var startTime=(new Date()).getTime();
		if (typeof OsfOMToken !='undefined' && OsfOMToken) {
			window.external.Execute(
				args.dispId,
				toArray(args.hostCallArgs),
				function OSF_DDA_SafeArrayFacade$Execute_OnResponse(hostResponseArgs) {
					if (args.onReceiving) {
						args.onReceiving();
					}
					var result=hostResponseArgs.toArray();
					var status=result[OSF.DDA.SafeArray.Response.Status];
					if (args.onComplete) {
						var payload;
						if (status==OSF.DDA.ErrorCodeManager.errorCodes.ooeSuccess) {
							if (result.length > 2) {
								payload=[];
								for (var i=1; i < result.length; i++)
									payload[i - 1]=result[i];
							}
							else {
								payload=result[OSF.DDA.SafeArray.Response.Payload];
							}
						}
						else {
							payload=result[OSF.DDA.SafeArray.Response.Payload];
						}
						args.onComplete(status, payload);
					}
					if (OSF.AppTelemetry) {
						OSF.AppTelemetry.onMethodDone(args.dispId, args.hostCallArgs, Math.abs((new Date()).getTime() -  startTime), status);
					}
				},
				OsfOMToken
			);
		}
		else {
			window.external.Execute(
				args.dispId,
				toArray(args.hostCallArgs),
				function OSF_DDA_SafeArrayFacade$Execute_OnResponse1(hostResponseArgs) {
					if (args.onReceiving) {
						args.onReceiving();
					}
					var result=hostResponseArgs.toArray();
					var status=result[OSF.DDA.SafeArray.Response.Status];
					if (args.onComplete) {
						var payload;
						if (status==OSF.DDA.ErrorCodeManager.errorCodes.ooeSuccess) {
							if (result.length > 2) {
								payload=[];
								for (var i=1; i < result.length; i++)
									payload[i - 1]=result[i];
							}
							else {
								payload=result[OSF.DDA.SafeArray.Response.Payload];
							}
						}
						else {
							payload=result[OSF.DDA.SafeArray.Response.Payload];
						}
						args.onComplete(status, payload);
					}
					if (OSF.AppTelemetry) {
						OSF.AppTelemetry.onMethodDone(args.dispId, args.hostCallArgs, Math.abs((new Date()).getTime() -  startTime), status);
					}
				}
			);
		}
	}
	catch (ex) {
		OSF.DDA.SafeArray.Delegate._onException(ex, args);
	}
};
OSF.DDA.SafeArray.Delegate._getOnAfterRegisterEvent=function OSF_DDA_SafeArrayDelegate$GetOnAfterRegisterEvent(register, args) {
	var startTime=(new Date()).getTime();
	return function OSF_DDA_SafeArrayDelegate$OnAfterRegisterEvent(hostResponseArgs) {
		if (args.onReceiving) {
			args.onReceiving();
		}
		var status=hostResponseArgs.toArray ? hostResponseArgs.toArray()[OSF.DDA.SafeArray.Response.Status] : hostResponseArgs;
		if (args.onComplete) {
			args.onComplete(status)
		}
		if (OSF.AppTelemetry) {
			OSF.AppTelemetry.onRegisterDone(register, args.dispId, Math.abs((new Date()).getTime() - startTime), status);
		}
	}
}
OSF.DDA.SafeArray.Delegate.registerEventAsync=function OSF_DDA_SafeArray_Delegate$RegisterEventAsync(args) {
	if (args.onCalling) {
		args.onCalling();
	}
	var callback=OSF.DDA.SafeArray.Delegate._getOnAfterRegisterEvent(true, args);
	try {
		if (typeof OsfOMToken !='undefined' && OsfOMToken) {
			window.external.RegisterEvent(
				args.dispId,
				args.targetId,
				function OSF_DDA_SafeArrayDelegate$RegisterEventAsync_OnEvent(eventDispId, payload) {
					if (args.onEvent) {
						args.onEvent(payload);
					}
					if (OSF.AppTelemetry) {
						OSF.AppTelemetry.onEventDone(args.dispId);
					}
				},
				callback,
				OsfOMToken
			);
		}
		else {
			window.external.RegisterEvent(
				args.dispId,
				args.targetId,
				function OSF_DDA_SafeArrayDelegate$RegisterEventAsync_OnEvent1(eventDispId, payload) {
					if (args.onEvent) {
						args.onEvent(payload);
					}
					if (OSF.AppTelemetry) {
						OSF.AppTelemetry.onEventDone(args.dispId);
					}
				},
				callback
			);
		}
	}
	catch (ex) {
		OSF.DDA.SafeArray.Delegate._onException(ex, args);
	}
};
OSF.DDA.SafeArray.Delegate.unregisterEventAsync=function OSF_DDA_SafeArray_Delegate$UnregisterEventAsync(args) {
	if (args.onCalling) {
		args.onCalling();
	}
	var callback=OSF.DDA.SafeArray.Delegate._getOnAfterRegisterEvent(false, args);
	try {
		  if (typeof OsfOMToken !='undefined' && OsfOMToken) {
				window.external.UnregisterEvent(
					args.dispId,
					args.targetId,
					callback,
					OsfOMToken
				);
		}
		else{
				window.external.UnregisterEvent(
					args.dispId,
					args.targetId,
					callback
				);
		}
	}
	catch (ex) {
		OSF.DDA.SafeArray.Delegate._onException(ex, args);
	}
};
OSF.DDA.SafeArray.Delegate.MessageParent=function OSF_DDA_SafeArray_Delegate$MessageParent(args){
	try {
		if (args.onCalling) {
			args.onCalling();
		}
		var startTime=(new Date()).getTime();
		var message=args.hostCallArgs[Microsoft.Office.WebExtension.Parameters.MessageToParent];
		if (typeof window.external.MessageParent2 !='undefined' && typeof OsfOMToken !='undefined' && OsfOMToken) {
			var targetOrigin=args.hostCallArgs[Microsoft.Office.WebExtension.Parameters.TargetOrigin];
			window.external.MessageParent2(message, targetOrigin, OsfOMToken);
		}
		else {
			window.external.MessageParent(message);
		}
		if (args.onReceiving) {
			args.onReceiving();
		}
		if (OSF.AppTelemetry) {
			OSF.AppTelemetry.onMethodDone(args.dispId, args.hostCallArgs, Math.abs((new Date()).getTime() - startTime), result);
		}
		return result;
	}
	catch (ex) {
		var status;
		var number=ex.number;
		if (number) {
		switch (number) {
			case -2146828218:
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeNoCapability;
				break;
			case -2146827850:
			default:
				status=OSF.DDA.ErrorCodeManager.errorCodes.ooeInternalError;
				break;
			}
		}
		return status || OSF.DDA.ErrorCodeManager.errorCodes.ooeInternalError;
	}
}
OSF.DDA.PowerPointDocument=function OSF_DDA_PowerPointDocument(officeAppContext, settings) {
	OSF.DDA.PowerPointDocument.uber.constructor.call(this, officeAppContext, settings);
	OSF.DDA.DispIdHost.addAsyncMethods(this, [
		OSF.DDA.AsyncMethodNames.GetSelectedDataAsync,
		OSF.DDA.AsyncMethodNames.SetSelectedDataAsync,
		OSF.DDA.AsyncMethodNames.GetDocumentCopyAsync,
		OSF.DDA.AsyncMethodNames.GetActiveViewAsync,
		OSF.DDA.AsyncMethodNames.GetFilePropertiesAsync,
		OSF.DDA.AsyncMethodNames.GoToByIdAsync
	]);
	OSF.DDA.DispIdHost.addEventSupport(this, new OSF.EventDispatch([
		Microsoft.Office.WebExtension.EventType.DocumentSelectionChanged,
		Microsoft.Office.WebExtension.EventType.ActiveViewChanged
	]));
	OSF.OUtil.finalizeProperties(this);
};
OSF.DDA.PowerPointDocumentInternal=function OSF_DDA_PowerPointDocumentInternal() {
	OSF.DDA.DispIdHost.addAsyncMethods(this, [
		OSF.DDA.AsyncMethodNames.GetOfficeThemeAsync,
		OSF.DDA.AsyncMethodNames.GetDocumentThemeAsync
	]);
	OSF.DDA.DispIdHost.addEventSupport(this, new OSF.EventDispatch([
		Microsoft.Office.WebExtension.EventType.OfficeThemeChanged,
		Microsoft.Office.WebExtension.EventType.DocumentThemeChanged
	]));
	OSF.OUtil.finalizeProperties(this);
};
Microsoft.Office.WebExtension.Index={
	First: "first",
	Last: "last",
	Next: "next",
	Previous: "previous"
};
OSF.DDA.SafeArray.Delegate.ParameterMap.define({
	type: OSF.DDA.EventDispId.dispidDialogMessageReceivedEvent,
	fromHost: [
		{ name: OSF.DDA.EventDescriptors.DialogMessageReceivedEvent, value: OSF.DDA.SafeArray.Delegate.ParameterMap.self }
	],
	isComplexType: true
});
OSF.DDA.SafeArray.Delegate.ParameterMap.define({
	type: OSF.DDA.EventDescriptors.DialogMessageReceivedEvent,
	fromHost: [
		{ name: OSF.DDA.PropertyDescriptors.MessageType, value: 0 },
		{ name: OSF.DDA.PropertyDescriptors.MessageContent, value: 1 },
		{ name: OSF.DDA.PropertyDescriptors.MessageOrigin, value: 2 }
	],
	isComplexType: true
});
OSF.DDA.Slide=function OSF_DDA_Slide(input) {
	var mapList={
		"id": {
			value: parseInt(input[0])
		},
		"title": {
			value: input[1]
		},
		"index": {
			value: parseInt(input[2])
		}
	};
	var numField=0;
	for(var key in mapList) {
		if(mapList.hasOwnProperty(key)) {
			numField++;
		}
	}
	if(input.length !=numField) {
		throw OsfMsAjaxFactory.msAjaxError.argument("slide");
	}
	OSF.OUtil.defineEnumerableProperties(this, mapList);
	if(isNaN(this.id) || isNaN(this.index)) {
		throw OsfMsAjaxFactory.msAjaxError.argument("slide");
	}
};
OSF.DDA.SlideRange=function OSF_DDA_SlideRange(input) {
	var items=input.split("\n");
	var dataValid=true;
	var slides=[];
	for(var i=0; i < items.length && dataValid; i++) {
		var curSlide=OSF.OUtil.splitStringToList(items[i], ',');
		try {
			slides.push(new OSF.DDA.Slide(curSlide));
		}
		catch (e) {
			dataValid=false;
		}
	}
	if(!dataValid) {
		throw OsfMsAjaxFactory.msAjaxError.argument("sliderange");
	}
	OSF.OUtil.defineEnumerableProperties(this, {
		"slides": {
			value: slides
		}
	});
};
OSF.OUtil.extend(OSF.DDA.PowerPointDocument, OSF.DDA.Document);
OSF.InitializationHelper.prototype.prepareRightBeforeWebExtensionInitialize=function OSF_InitializationHelper$prepareRightBeforeWebExtensionInitialize(appContext) {
	var license=new OSF.DDA.License(appContext.get_eToken());
	if (this._hostInfo.isRichClient) {
		if (appContext.get_isDialog()) {
			if (OSF.DDA.UI.ChildUI) {
				appContext.ui=new OSF.DDA.UI.ChildUI();
			}
		} else {
			if (OSF.DDA.UI.ParentUI) {
				appContext.ui=new OSF.DDA.UI.ParentUI();
			}
		}
	}
	OSF._OfficeAppFactory.setContext(new OSF.DDA.Context(appContext, appContext.doc, license));
	var getDelegateMethods, parameterMap;
	var reason=appContext.get_reason();
	getDelegateMethods=OSF.DDA.DispIdHost.getRichClientDelegateMethods;
	parameterMap=OSF.DDA.SafeArray.Delegate.ParameterMap;
	reason=OSF.DDA.RichInitializationReason[reason];
	OSF._OfficeAppFactory.setHostFacade(new OSF.DDA.DispIdHost.Facade(getDelegateMethods, parameterMap));
	var getOfficeThemesCss=function GetOfficeThemesCss() {
		var cssFileName="officethemes.css"
		for (var i=0; i < document.styleSheets.length; i++) {
			var ss=document.styleSheets[i];
			if (!ss.disabled && ss.href
				&& (cssFileName==(ss.href.substring(ss.href.length - cssFileName.length, ss.href.length)).toLowerCase())){
				if ((!ss.cssRules) && (!ss.rules)) {
					return null
				}
				else {
				  return ss;
				}
			}
		}
	}
	var onComplete=function onComplete(reason) {
		OSF.OUtil.redefineList(Microsoft.Office.WebExtension.EventType, {
			DocumentSelectionChanged: "documentSelectionChanged",
			ActiveViewChanged: "activeViewChanged",
			DialogMessageReceived: "dialogMessageReceived",
			DialogEventReceived: "dialogEventReceived"
		});
		Microsoft.Office.WebExtension.initialize(reason);
	}
	var officeCss=getOfficeThemesCss();
	if (officeCss){
			var changeCss=function ChangeCss(officeCss, selector, newRule) {
				var length=officeCss.cssRules ? officeCss.cssRules.length : officeCss.rules.length;
				for (var i=0; i < length; i++) {
					var rule;
					if (officeCss.cssRules) {
						rule=officeCss.cssRules[i];
					}
					else {
						rule=officeCss.rules[i];
					}
					var ruleSelector=rule.selectorText;
					if ( ruleSelector !=="" && (ruleSelector.toLowerCase()==selector.toLowerCase()) ) {
						if (officeCss.cssRules) {
							officeCss.deleteRule(i);
							officeCss.insertRule(ruleSelector+newRule, i);
						}
						else {
							officeCss.removeRule(i);
							officeCss.addRule(ruleSelector, newRule, i);
						}
					}
				}
			}
			var previousDocumentThemeData=null;
			var changeDocumentThemeData=function ChangeDocumentThemeData(data) {
				var documentThemeCssMapping=[
					{ name: "primaryFontColor", cssSelector: ".office-docTheme-primary-fontColor", cssProperty: "color" },
					{ name: "primaryBackgroundColor", cssSelector: ".office-docTheme-primary-bgColor", cssProperty: "background-color" },
					{ name: "secondaryFontColor", cssSelector: ".office-docTheme-secondary-fontColor", cssProperty: "color" },
					{ name: "secondaryBackgroundColor", cssSelector: ".office-docTheme-secondary-bgColor", cssProperty: "background-color" },
					{ name: "accent1", cssSelector: ".office-contentAccent1-color", cssProperty: "color" },
					{ name: "accent2", cssSelector: ".office-contentAccent2-color", cssProperty: "color" },
					{ name: "accent3", cssSelector: ".office-contentAccent3-color", cssProperty: "color" },
					{ name: "accent4", cssSelector: ".office-contentAccent4-color", cssProperty: "color" },
					{ name: "accent5", cssSelector: ".office-contentAccent5-color", cssProperty: "color" },
					{ name: "accent6", cssSelector: ".office-contentAccent6-color", cssProperty: "color" },
					{ name: "accent1", cssSelector: ".office-contentAccent1-bgColor", cssProperty: "background-color" },
					{ name: "accent2", cssSelector: ".office-contentAccent2-bgColor", cssProperty: "background-color" },
					{ name: "accent3", cssSelector: ".office-contentAccent3-bgColor", cssProperty: "background-color" },
					{ name: "accent4", cssSelector: ".office-contentAccent4-bgColor", cssProperty: "background-color" },
					{ name: "accent5", cssSelector: ".office-contentAccent5-bgColor", cssProperty: "background-color" },
					{ name: "accent6", cssSelector: ".office-contentAccent6-bgColor", cssProperty: "background-color" },
					{ name: "accent1", cssSelector: ".office-contentAccent1-borderColor", cssProperty: "border-color" },
					{ name: "accent2", cssSelector: ".office-contentAccent2-borderColor", cssProperty: "border-color" },
					{ name: "accent3", cssSelector: ".office-contentAccent3-borderColor", cssProperty: "border-color" },
					{ name: "accent4", cssSelector: ".office-contentAccent4-borderColor", cssProperty: "border-color" },
					{ name: "accent5", cssSelector: ".office-contentAccent5-borderColor", cssProperty: "border-color" },
					{ name: "accent6", cssSelector: ".office-contentAccent6-borderColor", cssProperty: "border-color" },
					{ name: "hyperlink", cssSelector: ".office-a", cssProperty: "color" },
					{ name: "followedHyperlink", cssSelector: ".office-a:visited", cssProperty: "color" },
					{ name: "headerLatinFont", cssSelector: ".office-headerFont-latin", cssProperty: "font-family" },
					{ name: "headerEastAsianFont", cssSelector: ".office-headerFont-eastAsian", cssProperty: "font-family" },
					{ name: "headerScriptFont", cssSelector: ".office-headerFont-script", cssProperty: "font-family" },
					{ name: "headerLocalizedFont", cssSelector: ".office-headerFont-localized", cssProperty: "font-family" },
					{ name: "bodyLatinFont", cssSelector: ".office-bodyFont-latin", cssProperty: "font-family" },
					{ name: "bodyEastAsianFont", cssSelector: ".office-bodyFont-eastAsian", cssProperty: "font-family" },
					{ name: "bodyScriptFont", cssSelector: ".office-bodyFont-script", cssProperty: "font-family" },
					{ name: "bodyLocalizedFont", cssSelector: ".office-bodyFont-localized", cssProperty: "font-family" }
				];
				var realData=data.type=="documentThemeChanged" ? data.documentTheme : data;
				for (var i=0; i< documentThemeCssMapping.length; i++)
				{
					if (previousDocumentThemeData===null || previousDocumentThemeData[documentThemeCssMapping[i].name] !=realData[documentThemeCssMapping[i].name])
					{
						if (realData[documentThemeCssMapping[i].name] !=null && realData[documentThemeCssMapping[i].name] !="")
						{
							var insertableText=realData[documentThemeCssMapping[i].name];
							if (documentThemeCssMapping[i].cssProperty==="font-family") {
								insertableText='"'+insertableText.replace(/"/g, '\\"')+'"';
							}
							changeCss(officeCss, documentThemeCssMapping[i].cssSelector, "{"+documentThemeCssMapping[i].cssProperty+":"+insertableText+";}");
						}
						else
						{
							changeCss(officeCss, documentThemeCssMapping[i].cssSelector, "{}");
						}
					}
				}
				previousDocumentThemeData=realData;
			}
			var previousOfficeThemeData=null;
			var internal=new OSF.DDA.PowerPointDocumentInternal();
			var changeOfficeThemeData=function ChangeOfficeThemeData(data) {
				var officeThemeCssMapping=[
					{ name: "primaryFontColor", cssSelector: ".office-officeTheme-primary-fontColor", cssProperty: "color" },
					{ name: "primaryBackgroundColor", cssSelector: ".office-officeTheme-primary-bgColor", cssProperty: "background-color" },
					{ name: "secondaryFontColor", cssSelector: ".office-officeTheme-secondary-fontColor", cssProperty: "color" },
					{ name: "secondaryBackgroundColor", cssSelector: ".office-officeTheme-secondary-bgColor", cssProperty: "background-color" }
				];
				var realData=data.type=="officeThemeChanged" ? data.officeTheme : data;
				for (var i=0; i<officeThemeCssMapping.length; i++)
				{
					if (previousOfficeThemeData===null || previousOfficeThemeData[officeThemeCssMapping[i].name] !=realData[officeThemeCssMapping[i].name]) {
						if (realData[officeThemeCssMapping[i].name] !==undefined) {
							changeCss(officeCss, officeThemeCssMapping[i].cssSelector, "{"+officeThemeCssMapping[i].cssProperty+":"+realData[officeThemeCssMapping[i].name]+";}");
						}
					}
				}
				previousOfficeThemeData=realData;
			}
			var getAndprocessThemeData=function GetAndprocessThemeData(getThemeMethod, onSuccessProcessResult, onFailureProcessNextThemeData) {
					getThemeMethod(function (asyncResult) {
						if (asyncResult.status=="succeeded") {
							var data=asyncResult.value;
							onSuccessProcessResult(data);
						}
						else {
							if (onFailureProcessNextThemeData) {
								onFailureProcessNextThemeData();
							}
							else {
								onComplete(reason);
							}
						}
					});
			}
			var processOfficeThemeData=function ProcessOfficeThemeData(data) {
				changeOfficeThemeData(data);
				internal.addHandlerAsync(Microsoft.Office.WebExtension.EventType.OfficeThemeChanged, changeOfficeThemeData, null);
				onComplete(reason);
			}
			var processDocumentThemeData=function ProcessDocumentThemeData(data){
					changeDocumentThemeData(data)
					internal.addHandlerAsync(Microsoft.Office.WebExtension.EventType.DocumentThemeChanged, changeDocumentThemeData, null);
					getAndprocessThemeData(internal.getOfficeThemeAsync, processOfficeThemeData, null);
			};
			getAndprocessThemeData(internal.getDocumentThemeAsync,
								   processDocumentThemeData,
								   function(){
										getAndprocessThemeData(internal.getOfficeThemeAsync, processOfficeThemeData, null);
								   });
	}
	else {
		onComplete(reason);
	}
};

