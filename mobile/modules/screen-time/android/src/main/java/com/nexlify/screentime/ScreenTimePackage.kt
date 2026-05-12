package com.nexlify.screentime

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Package registration — tells Expo Modules which modules to load.
 */
class ScreenTimePackage : expo.modules.core.interfaces.Package {
  override fun createModules(
    reactContext: android.content.Context
  ): List<expo.modules.core.interfaces.InternalModule> = emptyList()

  override fun createExpoModules(): List<expo.modules.kotlin.modules.Module> =
    listOf(ScreenTimeModule())
}
